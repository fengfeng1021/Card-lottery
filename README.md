# 卡牌抽獎 Card Lottery

一個以 3D 卡組轉盤為主視覺的抽獎工具，使用 React 19 + Vite + Tailwind v4，動畫由 GSAP 驅動，資料存於瀏覽器 `localStorage`（純前端、無後端）。

## 功能

- **3D 卡組轉盤**：GSAP 驅動的立體輪播，含慣性、吸附、景深與指標視差；亦提供列表模式。
- **獎池管理**：自訂名稱、獎項、機率；支援從純文字 / Markdown / JSON 匯入獎項。
- **抽獎動畫**：洗牌 → 揭曉的 GSAP 時間軸序列。
- **抽獎記錄**：每次抽獎自動記錄（獎池、獎項、時間），可依獎池篩選、單筆刪除或清除全部。
- **可重複中獎開關**：自訂獎池可設定「可重複 / 不可重複中獎」；不可重複時，已中獎者會被排除，並可隨時重置。
- **內建預設名單（唯讀）**：內建「115 學年度第 21 屆畢業專題製作分組名單」，有幾組就有幾個獎池，獎項為該組成員。名冊屬固定資料，每次啟動都會依原順序還原，標題、成員與抽獎規則皆不可編輯，並固定為可重複中獎。
- **無障礙**：對話框具焦點鎖定、Escape 關閉、`aria` 標註；輪播支援鍵盤操作；尊重 `prefers-reduced-motion`。

## 本機執行

需求：Node.js 18+

```bash
npm install
npm run dev     # 啟動開發伺服器（http://localhost:3000）
npm run build   # 產生正式版到 dist/
npm run preview # 預覽正式版
npm run lint    # 型別檢查（tsc --noEmit）
```

內建預設名單為固定資料，每次啟動都會還原；自訂獎池則存於 `localStorage`，清除瀏覽器資料後僅剩內建名單。

## 部署

推送到 `main` 會觸發 `.github/workflows/deploy-pages.yml`，自動建置並部署到 GitHub Pages。
Vite `base: './'` 使用相對路徑，因此在子路徑託管也能正常運作。

## 技術

React 19 · Vite 6 · Tailwind CSS v4（`@tailwindcss/vite`）· GSAP 3 · lucide-react
