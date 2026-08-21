# 剧西西

西语影视剧学习应用。构建：`npm run build` · 测试：`npm test` · 端口：5182

## Target

| 平台 | 状态 |
|------|------|
| iPhone / iPad | Capacitor iOS · `npm run mobile:ios` |
| Android | Capacitor · `npm run mobile:android` |
| 手表 / 戒指 / 手杖 | 可选（Web 传感器 + 窄屏 CSS） |

## Harness / Loop（助手）

- 遵循根 `/Users/skat/AGENTS.md`：**Harness Engineering** + **Loop Engineering**
- Guide = 本文件；Sensor = 下方验证命令；同类失误第二次须沉淀规则或测试（棘轮）
- 开干前写清 **Done**；每切片过验证环；显式停止（成功 / 上限 / 无进展 / 人审）
- 详解：`docs/HARNESS_ENGINEERING.md`、`docs/LOOP_ENGINEERING.md`

## 验证环 / Done

```bash
npm install
npm test
npm run build
npx cap sync android   # 若有 android/
npx cap sync ios       # 若有 ios/
# Android APK：JAVA_HOME=…/openjdk@17 npm run apk:debug
# iOS 模拟器/真机：npm run mobile:ios（需 Mac + Xcode）
```

**Done 示例**：测试通过 + web 产物进 `www/` + `cap sync android` 与 `cap sync ios` 无报错。Xcode Run 为 iOS 真机验收项。
