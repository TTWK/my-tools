const cliPath = process.env.WECHAT_DEVTOOLS_CLI_PATH
const projectPath = process.env.WECHAT_MINIPROGRAM_PROJECT_PATH

if (!cliPath || !projectPath) {
  console.log(
    '[e2e] 缺少环境变量 WECHAT_DEVTOOLS_CLI_PATH 或 WECHAT_MINIPROGRAM_PROJECT_PATH，已跳过。',
  )
  process.exit(0)
}

console.log('[e2e] 已检测到环境变量，但当前尚未接入 miniprogram-automator 用例。')
process.exit(0)
