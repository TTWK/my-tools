# Pinia 依赖冲突排查记录

## 现象

在当前 uni-app（Vue 3.4.x）模板工程中引入 Pinia 时，`npm install` 报 `ERESOLVE`，提示 Pinia 的 peerDependency 需要 `vue ^3.5.11`。

## 影响

- 无法在不升级 Vue 的前提下直接安装 Pinia
- 升级 Vue 可能带来与 uni-app 生态版本联动的风险，需要更谨慎的验证

## 根因

Pinia 新版本将 Vue 的 peer 依赖范围上调到了 `^3.5.11`，而当前模板依赖 `vue ^3.4.21`。

## 处理方案（当前采用）

- 暂不引入 Pinia
- 采用“单例 reactive store + 纯 domain”方式落地计分器核心能力：
  - domain 负责业务规则与可测试逻辑
  - store 负责状态聚合与页面调用

对应实现：

- store：[store.ts](file:///d:/workspace/FROM_GITHUB/my-tools/src/features/scorekeeper/store.ts)
- domain：[scorekeeper.ts](file:///d:/workspace/FROM_GITHUB/my-tools/src/domain/scorekeeper/scorekeeper.ts)

## 后续改进

- 若需要引入 Pinia：统一升级 Vue 与相关依赖后再接入，并在 CI 中增加构建验证（mp-weixin）以降低风险。
