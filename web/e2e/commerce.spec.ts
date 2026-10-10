import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { controlSource, fixtureCatalog } from "./fixtures";

test("proposal deep links and browser Back restore direction, surface and device", async ({
  page,
}) => {
  await controlSource(page);
  await page.goto("/#/proposals?proposal=01&surface=home&device=mobile");
  await expect(
    page.locator(".kp-proposal-screen.direction-01.screen-home"),
  ).toBeVisible();
  await page.evaluate(() => {
    window.location.hash =
      "#/proposals?proposal=02&surface=detail&device=desktop";
  });
  await expect(
    page.locator(".kp-proposal-screen.direction-02.screen-detail"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "데스크톱", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goBack();
  await expect(
    page.locator(".kp-proposal-screen.direction-01.screen-home"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "휴대폰", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("local shopping and several children survive navigation and reload", async ({
  page,
}) => {
  await controlSource(page);
  await page.goto("/#/technical/home");
  await expect(page.locator("[data-product-card]").first()).toBeVisible();
  await page
    .locator('[data-product-card="qa-01"]')
    .getByRole("button", { name: "찜하기", exact: true })
    .click();
  await page.locator('[data-product="qa-01"]').click();
  const detail = page.getByRole("dialog", { name: "상품 상세" });
  await expect(
    detail.getByRole("button", { name: "1번째 사진" }),
  ).toHaveAttribute("aria-pressed", "true");
  await detail.getByRole("button", { name: "2번째 사진" }).click();
  await expect(
    detail.getByRole("button", { name: "2번째 사진" }),
  ).toHaveAttribute("aria-pressed", "true");
  await detail.getByLabel("희망 가격", { exact: true }).fill("8000");
  await detail.getByRole("button", { name: "저장", exact: true }).click();
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "마이", exact: true }).click();
  await page.getByRole("button", { name: "아이 정보 등록" }).click();
  const child = page.getByRole("dialog", { name: "우리 아이 정보" });
  await child.getByLabel("아이 별명").fill("테스트 첫째");
  await child.getByLabel("월령 · 개월").fill("0");
  await child.getByLabel("키 · cm").fill("50");
  await child.getByLabel("몸무게 · kg").fill("4");
  await child.getByRole("button", { name: "아이 정보 저장" }).click();
  await page.getByRole("button", { name: "아이 정보 관리" }).click();
  await expect(child.getByLabel("아이 별명")).toHaveValue("테스트 첫째");
  await child.getByRole("button", { name: "아이 추가" }).click();
  await child.getByLabel("아이 별명").fill("테스트 둘째");
  await child.getByLabel("월령 · 개월").fill("12");
  await child.getByLabel("키 · cm").fill("76");
  await child.getByLabel("몸무게 · kg").fill("10");
  await child.getByRole("button", { name: "아이 정보 저장" }).click();
  await expect(page.getByText("테스트 둘째 · 12개월 · 76cm")).toBeVisible();
  await page.reload();
  await expect(page.getByText("테스트 둘째 · 12개월 · 76cm")).toBeVisible();
  await page.getByRole("link", { name: "찜", exact: true }).click();
  await expect(page.locator('[data-product-card="qa-01"]')).toBeVisible();
  await page.locator('[data-product="qa-01"]').click();
  await expect(detail.getByLabel("희망 가격", { exact: true })).toHaveValue(
    "8000",
  );
  await expect(detail.getByText("꼬까핏 · 테스트 둘째")).toBeVisible();
  await expect(detail.getByText("80 우선 확인", { exact: true })).toBeVisible();
});

test("photo mode starts as a gapless 3×4 grid, appends on scrolling and keeps its opener", async ({
  page,
}) => {
  await controlSource(page);
  await page.goto("/#/technical/search?mode=photos");
  await expect(page.locator("[data-photo]")).toHaveCount(12);
  const shape = await page.locator(".photo-feed").evaluate((element) => ({
    cols: getComputedStyle(element).gridTemplateColumns.split(" ").length,
    gap: getComputedStyle(element).gap,
  }));
  expect(shape).toEqual({ cols: 3, gap: "0px" });
  await page.mouse.wheel(0, 180);
  await expect(page.locator("[data-photo]")).toHaveCount(24);
  const opener = page.locator("[data-photo]").nth(20);
  const openerId = await opener.getAttribute("data-photo");
  await opener.click();
  await expect(
    page.getByRole("dialog", { name: "사진 속 상품" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(`[data-photo="${openerId}"]`)).toBeFocused();
  expect(await page.locator("[data-photo]").count()).toBeGreaterThanOrEqual(24);
  await expect(
    page.getByRole("button", { name: "더보기", exact: true }),
  ).toHaveCount(0);
});

test("live search does not make browser Back erase the query character by character", async ({
  page,
}) => {
  await controlSource(page);
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/#/technical/home");
  await page.getByRole("link", { name: "검색", exact: true }).click();
  await expect(page).toHaveURL(/technical\/search$/);
  const input = page.getByRole("searchbox");
  await input.pressSequentially("UI", { delay: 25 });
  await expect(input).toHaveValue("UI");
  await expect(page).toHaveURL(/technical\/search\?q=UI$/);
  await input.press("Enter");
  await page.goBack();
  await expect(page).toHaveURL(/technical\/home$/);
});

test("closing an opened product consumes its overlay history and preserves list filters", async ({
  page,
}) => {
  await controlSource(page);
  await page.goto("/#/technical/home?q=UI&sort=low&mode=photos");
  await page.getByRole("link", { name: "검색", exact: true }).click();
  await page.locator("[data-photo]").first().click();
  const detail = page.getByRole("dialog", { name: "사진 속 상품" });
  await expect(detail).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(detail).not.toBeVisible();
  await expect(page).toHaveURL(/technical\/search\?q=UI&sort=low&mode=photos$/);
  await expect(page.getByRole("searchbox")).toHaveValue("UI");
  await page.goBack();
  await expect(page).toHaveURL(/technical\/home\?q=UI&sort=low&mode=photos$/);
});

test("direct and reloaded product links close in place without consuming unrelated history", async ({
  page,
}) => {
  await controlSource(page);
  await page.goto("/#/technical/my");
  await page.goto("/#/technical/search?sort=low&product=qa-01");
  const detail = page.getByRole("dialog", { name: "상품 상세" });
  await expect(detail).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/technical\/search\?sort=low$/);
  await page.locator('[data-product="qa-01"]').click();
  await expect(detail).toBeVisible();
  await page.reload();
  await expect(detail).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/technical\/search\?sort=low$/);
  await expect(detail).not.toBeVisible();
});

test("browser Back and Forward preserve an appended photo feed and its product opener", async ({
  page,
}) => {
  await controlSource(page);
  await page.goto("/#/technical/search?mode=photos");
  await expect(page.locator("[data-photo]")).toHaveCount(12);
  await page.mouse.wheel(0, 180);
  await expect(page.locator("[data-photo]")).toHaveCount(24);
  const opener = page.locator("[data-photo]").nth(20);
  await opener.scrollIntoViewIfNeeded();
  const id = await opener.getAttribute("data-photo");
  await opener.evaluate((element) => {
    element.addEventListener(
      "click",
      () => {
        (
          window as Window & { controlledOpenerScrollY: number }
        ).controlledOpenerScrollY = scrollY;
      },
      { capture: true, once: true },
    );
  });
  await opener.click();
  const scroll = await page.evaluate(
    () =>
      (window as Window & { controlledOpenerScrollY: number })
        .controlledOpenerScrollY,
  );
  const detail = page.getByRole("dialog", { name: "사진 속 상품" });
  await expect(detail).toBeVisible();
  await page.goBack();
  await expect(detail).not.toBeVisible();
  await expect(page.locator(`[data-photo="${id}"]`)).toBeFocused();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(scroll);
  expect(await page.locator("[data-photo]").count()).toBeGreaterThanOrEqual(24);
  await page.goForward();
  await expect(detail).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(detail).not.toBeVisible();
  await expect(page).toHaveURL(/technical\/search\?mode=photos$/);
});

test("an altered product route cannot consume the original product history entry", async ({
  page,
}) => {
  await controlSource(page);
  await page.goto("/#/technical/search?sort=low");
  await page.locator('[data-product="qa-01"]').click();
  const detail = page.getByRole("dialog", { name: "상품 상세" });
  await expect(detail).toBeVisible();
  await page.evaluate(() => {
    window.location.hash = "#/technical/search?sort=low&product=qa-02";
  });
  await expect(page).toHaveURL(/product=qa-02$/);
  await page.keyboard.press("Escape");
  await expect(detail).not.toBeVisible();
  await expect(page).toHaveURL(/technical\/search\?sort=low$/);
});

test("source expiration closes an open product and keeps saved records and its safe Back route", async ({
  page,
}) => {
  await controlSource(page);
  await page.goto("/#/technical/search?sort=low");
  await page
    .locator('[data-product-card="qa-01"]')
    .getByRole("button", { name: "찜하기", exact: true })
    .click();
  await page.locator('[data-product="qa-01"]').click();
  await expect(page.getByRole("dialog", { name: "상품 상세" })).toBeVisible();
  await page.clock.runFor(89 * 60000);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator("[data-product-card]")).toHaveCount(0);
  await expect(
    page.getByText("상품 사진 표시 기한이 지났어요.", { exact: true }),
  ).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/technical\/search\?sort=low$/);
  expect(
    JSON.parse(
      (await page.evaluate(() => localStorage.getItem("favs"))) || "[]",
    ),
  ).toContain("qa-01");
});

test("returning from account restores the same photo list position without automatically appending", async ({
  page,
}) => {
  await controlSource(page);
  await page.goto("/#/technical/search?mode=photos");
  await expect(page.locator("[data-photo]")).toHaveCount(12);
  await page.mouse.wheel(0, 180);
  await expect(page.locator("[data-photo]")).toHaveCount(24);
  const scroll = await page.evaluate(() => scrollY);
  expect(scroll).toBeGreaterThan(0);
  await page.getByRole("link", { name: "마이", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "마이", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "검색", exact: true }).click();
  await expect(page.locator("[data-photo]")).toHaveCount(24);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(scroll);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let frames = 0;
        const next = () =>
          ++frames === 6 ? resolve() : requestAnimationFrame(next);
        requestAnimationFrame(next);
      }),
  );
  await expect(page.locator("[data-photo]")).toHaveCount(24);
  await page.getByRole("searchbox").fill("UI 검증용");
  await expect(page.locator("[data-photo]")).toHaveCount(12);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.getByRole("button", { name: "상품 목록", exact: true }).click();
  await expect(page.locator("[data-product-card]")).toHaveCount(20);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
});

test("only eight recently visited list contexts are kept in memory", async ({
  page,
}) => {
  await controlSource(page);
  await page.goto("/#/technical/search?mode=photos");
  await expect(page.locator("[data-photo]")).toHaveCount(12);
  await page.mouse.wheel(0, 180);
  await expect(page.locator("[data-photo]")).toHaveCount(24);
  for (let index = 0; index < 9; index++) {
    const query = "UI" + " ".repeat(index);
    await page.getByRole("searchbox").fill(query);
    await expect
      .poll(() =>
        page.evaluate(() =>
          new URLSearchParams(location.hash.split("?")[1]).get("q"),
        ),
      )
      .toBe(query);
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    await expect(page.locator("[data-photo]")).toHaveCount(12);
  }
  await page.getByRole("button", { name: "검색어 지우기" }).click();
  await expect(page).toHaveURL(/technical\/search\?mode=photos$/);
  await expect(page.locator("[data-photo]")).toHaveCount(12);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).filter((key) =>
        /scroll|pagination|context/i.test(key),
      ),
    ),
  ).toEqual([]);
});

test("loading source while switching tabs does not remember a zero product page size", async ({
  page,
}) => {
  await controlSource(page);
  let releaseSource!: () => void;
  const sourceReady = new Promise<void>((resolve) => {
    releaseSource = resolve;
  });
  await page.route("**/data/catalog.json?*", async (route) => {
    await sourceReady;
    await route.fulfill({ json: fixtureCatalog() });
  });
  await page.goto("/#/technical/search?mode=photos");
  await expect(
    page.getByText("상품 원본을 확인하고 있어요.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "마이", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "마이", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "검색", exact: true }).click();
  await expect(page).toHaveURL(/technical\/search\?mode=photos$/);
  releaseSource();
  await expect(page.locator("[data-photo]")).toHaveCount(12);
  await expect(page.getByText("40개", { exact: true })).toBeVisible();
});

test("denied storage shows persistent failure and retains child input", async ({
  page,
}) => {
  await controlSource(page, { blockedStorage: true });
  await page.goto("/#/technical/my");
  await page.getByRole("button", { name: "아이 정보 등록" }).click();
  const child = page.getByRole("dialog", { name: "우리 아이 정보" });
  await child.getByLabel("아이 별명").fill("테스트 입력");
  await child.getByLabel("월령 · 개월").fill("8");
  await child.getByLabel("키 · cm").fill("70");
  await child.getByLabel("몸무게 · kg").fill("9");
  await child.getByRole("button", { name: "아이 정보 저장" }).click();
  await expect(child.getByRole("alert")).toContainText("저장하지 못했어요");
  await expect(child.getByLabel("아이 별명")).toHaveValue("테스트 입력");
  expect(
    await page.evaluate(() => localStorage.getItem("kkokkapickChildProfiles")),
  ).toBeNull();
});

test("exact source expiration removes photos without deleting saved records", async ({
  page,
}) => {
  await controlSource(page);
  await page.goto("/#/technical/search");
  await expect(page.locator("[data-product-card]").first()).toBeVisible();
  await page
    .locator('[data-product-card="qa-01"]')
    .getByRole("button", { name: "찜하기", exact: true })
    .click();
  await page.clock.runFor(89 * 60000);
  await expect(
    page.getByText("상품 사진 표시 기한이 지났어요.", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("[data-product-card]")).toHaveCount(0);
  expect(
    JSON.parse(
      (await page.evaluate(() => localStorage.getItem("favs"))) || "[]",
    ),
  ).toContain("qa-01");
});

test("unavailable and expired catalogs request no normal original photos", async ({
  page,
}) => {
  await controlSource(page, { expired: true });
  const photos: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("search_img.php")) photos.push(request.url());
  });
  await page.goto("/#/technical/home");
  await expect(
    page.getByText("상품 사진 표시 기한이 지났어요.", { exact: true }),
  ).toBeVisible();
  expect(photos).toEqual([]);
  await page.getByRole("link", { name: "새 디자인 10안 비교" }).click();
  await expect(page.locator(".kp-proposal-gallery")).toBeVisible();
  expect(photos).toEqual([]);
});

for (const width of [320, 375, 390, 430, 1440]) {
  test(`controlled five-screen responsive and accessibility checks at ${width}px`, async ({
    page,
  }, testInfo) => {
    await controlSource(page);
    await page.setViewportSize({ width, height: width >= 768 ? 1000 : 844 });
    await page.addInitScript(() =>
      localStorage.setItem("favs", JSON.stringify(["qa-01", "qa-02"])),
    );
    for (const screen of ["home", "search", "detail", "wishlist", "my"]) {
      await page.goto(
        `/#/technical/${screen === "detail" ? "search?product=qa-01" : screen}`,
      );
      await expect(page.locator(".technical-nav")).toBeVisible();
      if (screen === "detail")
        await expect(
          page.getByRole("dialog", { name: "상품 상세" }),
        ).toBeVisible();
      else if (screen !== "my")
        await expect(page.locator("[data-product-card]").first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const bounds = await page.evaluate(() => ({
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(bounds.scroll).toBeLessThanOrEqual(bounds.width);
      const a11y = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        a11y.violations.map(
          (v) =>
            `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
        ),
      ).toEqual([]);
      await page.screenshot({
        path: testInfo.outputPath(`${width}-${screen}-controlled-viewport.png`),
      });
      await page.screenshot({
        path: testInfo.outputPath(`${width}-${screen}-controlled.png`),
        fullPage: true,
      });
    }
  });
}
