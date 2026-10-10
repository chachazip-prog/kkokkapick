import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { controlSource } from "./fixtures";

test("second-round expired sources render no goods or repeated campaign grid", async ({
  page,
}) => {
  await controlSource(page, { expired: true });
  const originals: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("search_img.php")) originals.push(request.url());
  });
  for (const id of ["06", "08", "09"]) {
    for (const surface of ["home", "search", "detail"]) {
      await page.goto(
        `/#/proposals?proposal=${id}&surface=${surface}&device=mobile`,
      );
      const screen = page.locator(".kp-refined-screen");
      await expect(screen).toBeVisible();
      await expect(
        screen.locator(".kr-photo, .kr-price, .kr-brand-directory"),
      ).toHaveCount(0);
      expect(await screen.locator("img").count()).toBeLessThanOrEqual(1);
      expect(originals).toEqual([]);
    }
  }
});

test("second-round photo discovery appends in its scroll frame and opens the selected card", async ({
  page,
}) => {
  await controlSource(page);
  await page.goto("/#/proposals?proposal=08&surface=home&device=mobile");
  const feed = page.locator(".kr-photo-feed");
  await expect(feed.locator(".kr-photo")).toHaveCount(12);
  expect(
    await feed.evaluate((element) => ({
      cols: getComputedStyle(element).gridTemplateColumns.split(" ").length,
      gap: getComputedStyle(element).gap,
    })),
  ).toEqual({ cols: 3, gap: "0px" });
  await feed.hover();
  await page.mouse.wheel(0, 250);
  await expect
    .poll(() => feed.locator(".kr-photo").count())
    .toBeGreaterThan(12);
  await page
    .getByRole("button", { name: "상품 정보 보기", exact: true })
    .click();
  await expect(page.locator(".kr-product-grid")).toBeVisible();
  await page.getByRole("button", { name: "사진 보기", exact: true }).click();
  await expect(feed).toBeVisible();
  const opener = feed.locator(".kr-photo").nth(2);
  await opener.click();
  const card = page.getByRole("dialog", { name: "선택한 상품" });
  await expect(card).toBeVisible();
  await expect(card).toContainText("UI 검증용 3");
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
  await expect(
    page.getByRole("button", { name: "더보기", exact: true }),
  ).toHaveCount(0);
});

test("saved selection stays correct outside a narrowed search and retains photo dots", async ({
  page,
}) => {
  await controlSource(page);
  await page.goto("/#/proposals?proposal=08&surface=search&device=mobile");
  await page.locator(".kr-photo-feed .kr-photo").first().click();
  let card = page.getByRole("dialog", { name: "선택한 상품" });
  await card.getByRole("button", { name: "찜하기", exact: true }).click();
  await page.keyboard.press("Escape");
  await page.locator(".kr-search input").fill("아주 긴");
  await expect(page.locator(".kr-photo-feed .kr-photo")).toHaveCount(1);
  await page
    .locator(".kp-refined-header")
    .getByRole("button", { name: "찜한 상품 1개" })
    .click();
  await page
    .getByRole("dialog", { name: "담은 옷" })
    .locator(".kr-photo")
    .click();
  card = page.getByRole("dialog", { name: "선택한 상품" });
  await expect(card).toContainText("우주복");
  await expect(card).toContainText("판매처 2곳 비교");
  await card.getByRole("button", { name: "상품 자세히 보기" }).click();
  await expect(page.locator(".kr-detail-gallery")).toBeVisible();
  await expect(page.locator(".kr-dots .kr-dot")).toHaveCount(3);
  await page.getByRole("button", { name: "3장 중 2번째 사진" }).click();
  await expect(
    page.getByRole("button", { name: "3장 중 2번째 사진" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("clothing and play preserve separate queries and use actual catalog categories", async ({
  page,
}) => {
  await controlSource(page);
  await page.goto("/#/proposals?proposal=09&surface=search&device=mobile");
  await page.locator(".kr-search input").fill("아기 의류");
  await page
    .locator(".kr-domain-switch")
    .getByRole("button", { name: "장난감·교구", exact: true })
    .click();
  await expect(page.locator(".kr-search input")).toHaveValue("");
  await page
    .locator(".kr-categories")
    .getByRole("button", { name: "블록/교구", exact: true })
    .click();
  await expect(page.locator(".kr-product-card")).toHaveCount(4);
  await page.locator(".kr-search input").fill("놀이 교구");
  await page
    .locator(".kr-domain-switch")
    .getByRole("button", { name: "아이 옷", exact: true })
    .click();
  await expect(page.locator(".kr-search input")).toHaveValue("아기 의류");
  await page
    .locator(".kr-domain-switch")
    .getByRole("button", { name: "장난감·교구", exact: true })
    .click();
  await expect(page.locator(".kr-search input")).toHaveValue("놀이 교구");
  await page.locator(".kr-photo").first().click();
  await expect(page.locator(".kr-specs")).toContainText("사용 연령");
  await expect(page.locator(".kr-specs")).not.toContainText("판매 사이즈");
  await expect(page.locator(".kr-specs")).toContainText("판매처에서 확인");
});

test("revised saved sheet appends after twenty saved products", async ({
  page,
}) => {
  await controlSource(page);
  await page.goto("/#/proposals?proposal=06&surface=search&device=mobile");
  for (let index = 0; index < 21; index++) {
    if (index === 20) {
      await page
        .locator(".kp-refined-content")
        .evaluate((element) => element.scrollTo(0, element.scrollHeight));
      await expect(page.locator(".kr-product-card")).toHaveCount(40);
    }
    await page.locator(".kr-product-card .kr-save").nth(index).click();
  }
  await page
    .locator(".kp-refined-header")
    .getByRole("button", { name: "찜한 상품 21개" })
    .click();
  const dialog = page.getByRole("dialog", { name: "담은 옷" });
  await expect(dialog.locator(".kr-product-card")).toHaveCount(20);
  await dialog.evaluate((element) => element.scrollTo(0, element.scrollHeight));
  await expect(dialog.locator(".kr-product-card")).toHaveCount(21);
});

test("revised detail starts at its image after a scrolled product selection", async ({
  page,
}) => {
  await controlSource(page);
  for (const id of ["06", "09"]) {
    await page.goto(`/#/proposals?proposal=${id}&surface=search&device=mobile`);
    await page
      .locator(".kp-refined-content")
      .evaluate((element) => element.scrollTo(0, 750));
    await page.locator(".kr-photo").nth(5).click();
    await expect(page.locator(".kr-detail-gallery")).toBeVisible();
    expect(
      await page
        .locator(".kp-refined-content")
        .evaluate((element) => element.scrollTop),
    ).toBe(0);
  }
});

test("revised cards and gallery share bounded original recovery and healthy alternates", async ({
  page,
}) => {
  await controlSource(page);
  let failedRequests = 0;
  await page.route(/search_img\.php\?code=ui-test-qa-01-0$/, (route) => {
    failedRequests++;
    return route.fulfill({ status: 404, body: "expired test image" });
  });
  await page.goto("/#/proposals?proposal=08&surface=search&device=mobile");
  const first = page.locator(".kr-photo-feed .kr-photo").first();
  await expect(first.locator("img")).toHaveAttribute(
    "src",
    /ui-test-qa-01-1$/,
    { timeout: 15000 },
  );
  // StrictMode/browser preload may issue two initial rendered requests, plus two shared probes.
  expect(failedRequests).toBeLessThanOrEqual(4);
  const boundedTotal = failedRequests;
  await first.click();
  await page
    .getByRole("dialog", { name: "선택한 상품" })
    .getByRole("button", { name: "상품 자세히 보기" })
    .click();
  await expect(page.locator(".kr-detail-gallery img")).toHaveAttribute(
    "src",
    /ui-test-qa-01-1$/,
  );
  await expect(page.locator(".kr-dot")).toHaveCount(2);
  expect(failedRequests).toBe(boundedTotal);
});

test("revised photo offline messages stay within the image and recover online", async ({
  page,
}, testInfo) => {
  await controlSource(page);
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "onLine", {
      get: () => false,
      configurable: true,
    }),
  );
  let broken = true;
  await page.route(/search_img\.php\?code=ui-test-qa-01-0$/, (route) =>
    broken
      ? route.fulfill({ status: 404, body: "offline image test" })
      : route.fallback(),
  );
  await page.goto("/#/proposals?proposal=08&surface=home&device=mobile");
  const first = page.locator(".kr-photo-feed .kr-photo").first();
  await expect(first).toContainText("인터넷 연결 후 사진을 다시 확인해요.");
  const bounds = await first.evaluate((element) => {
    const outer = element.getBoundingClientRect();
    const message = element
      .querySelector(".photo-state")!
      .getBoundingClientRect();
    return (
      message.top >= outer.top &&
      message.bottom <= outer.bottom &&
      message.left >= outer.left &&
      message.right <= outer.right
    );
  });
  expect(bounds).toBe(true);
  await page.locator(".kp-refined-screen").screenshot({
    path: testInfo.outputPath("08-offline-photo-390-controlled.png"),
  });
  broken = false;
  await page.evaluate(() => {
    Object.defineProperty(navigator, "onLine", {
      get: () => true,
      configurable: true,
    });
    window.dispatchEvent(new Event("online"));
  });
  await expect(first.locator(".photo-state")).toHaveCount(0);
  await expect(first.locator("img")).toBeVisible();
});

test("revised product dialog restores header focus when source expiry removes its opener", async ({
  page,
}) => {
  await controlSource(page);
  await page.goto("/#/proposals?proposal=08&surface=search&device=mobile");
  await page.locator(".kr-photo-feed .kr-photo").first().click();
  const dialog = page.getByRole("dialog", { name: "선택한 상품" });
  await expect(dialog).toBeVisible();
  await page.clock.fastForward(91 * 60000);
  await expect(page.locator(".kr-photo-feed .kr-photo")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "꼬까픽 홈" })).toBeFocused();
});

for (const width of [320, 375, 390, 430, 1440]) {
  test(`second-round controlled compositions and overlay access at ${width}px`, async ({
    page,
  }, testInfo) => {
    await controlSource(page);
    await page.setViewportSize({ width, height: width >= 768 ? 1000 : 844 });
    for (const id of ["06", "08", "09"]) {
      for (const surface of ["home", "search", "detail"]) {
        await page.goto(
          `/#/proposals?proposal=${id}&surface=${surface}&device=${width >= 768 ? "desktop" : "mobile"}`,
        );
        const screen = page.locator(".kp-refined-screen");
        await expect(screen).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        const bounds = await page.evaluate(() => ({
          width: innerWidth,
          scroll: document.documentElement.scrollWidth,
          frame: document.querySelector(".kp-refined-screen")!.clientWidth,
          frameScroll:
            document.querySelector(".kp-refined-screen")!.scrollWidth,
        }));
        expect(bounds.scroll).toBeLessThanOrEqual(bounds.width);
        expect(bounds.frameScroll).toBeLessThanOrEqual(bounds.frame);
        const axe = await new AxeBuilder({ page })
          .include(".kp-refined-screen")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        expect(
          axe.violations.map((v) => ({
            id: v.id,
            targets: v.nodes.map((n) => n.target),
          })),
        ).toEqual([]);
        await screen.evaluate((element) => {
          element.scrollIntoView({ block: "start" });
          element.querySelector(".kp-refined-content")!.scrollTop = 0;
        });
        if (id === "08" && surface !== "detail" && width < 768) {
          const photos = screen.locator(".kr-photo-feed .kr-photo");
          await expect(photos).toHaveCount(12);
          const visibleGrid = await screen.evaluate((element) => {
            const viewport = element
              .querySelector(".kp-refined-content")!
              .getBoundingClientRect();
            const first = element
              .querySelector(".kr-photo-feed .kr-photo")!
              .getBoundingClientRect();
            const last = element
              .querySelector(".kr-photo-feed .kr-photo:nth-child(12)")!
              .getBoundingClientRect();
            return first.top >= viewport.top && last.bottom <= viewport.bottom;
          });
          expect(visibleGrid).toBe(true);
        }
        await screen.screenshot({
          path: testInfo.outputPath(`${id}-${surface}-${width}-controlled.png`),
        });
      }
      await page.getByRole("button", { name: "열린 화면 보기" }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await dialog.screenshot({
        path: testInfo.outputPath(`${id}-overlay-${width}-controlled.png`),
      });
      const count = await dialog.locator("button,input,a[href]").count();
      for (let i = 0; i < count + 3; i++) {
        await page.keyboard.press("Tab");
        expect(
          await dialog.evaluate((element) =>
            element.contains(document.activeElement),
          ),
        ).toBe(true);
      }
      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("button", { name: "열린 화면 보기" }),
      ).toBeFocused();
    }
  });
}
