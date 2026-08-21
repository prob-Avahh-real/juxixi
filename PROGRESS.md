# 完善剧西西 · 进度

## 里程碑（按顺序，每片独立可验证）

| # | 切片 | 验证 |
|---|------|------|
| F | 首次提交：整理 `.gitignore` / 不入产物 + `git commit` 一次 | `git log -1` |
| A | iOS 工程可装：补 Info.plist iPad 朝向键 / `cap sync` 跑通 | `npm test` 全绿 + `npx cap sync ios` 无错 |
| D | iPad/横屏深化：分栏布局 + 键盘快捷键 + CSS 补齐 | 测试 + `npm run build` + 视觉规则断言 |
| C | 练习机制深化：错题本导出 + 复习会话队列 + 跟读超时 | 新单元测试 + build 通过 |
| G | 离线 PWA：manifest + service worker（追剧模式离线可用） | 测试断言文件存在 + 缓存命中 |

## Done 定义

- F：`git log` 有 1 个 commit，仓库状态干净
- A：`npm test` 23/23 绿，`npx cap sync ios` 无报错
- D：`npm run build` 通过；新增 iPad CSS / 快捷键测试断言
- C：新测试覆盖 `reviewQueue`、`exportMistakes`、跟读超时；build 通过
- G：manifest + sw 测试 + build 通过；iOS/Web 离线可用

## 停止条件

- 任一片段连续 2 次失败 → 收窄范围 / 改 Harness，先不扩散
- 用户变更方向 → 立即停

## 风险与对策

- iOS 测试断言用了 ~ipad 后缀，但 Capacitor 默认模板里有这键；补齐后断言即过
- iPad 双栏需小心不破坏窄屏 / 眼镜模式 → 用 `min-width: 768px` 包裹
- Service Worker 不能缓存 API（项目没后端），只缓存 www/ 静态资源
- 错题本导出用 localStorage JSON 下载，避免引入新依赖
