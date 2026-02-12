declare const wx:
  | undefined
  | {
      cloud?: {
        init?: (options: unknown) => void
        callFunction?: (options: unknown) => Promise<unknown>
      }
    }
