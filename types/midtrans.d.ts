interface SnapCallback {
    onSuccess: (result: any) => void
    onPending: (result: any) => void
    onError: (result: any) => void
    onClose: () => void
  }
  
  interface SnapInterface {
    pay: (token: string, options: SnapCallback) => void
  }
  
  interface Window {
    snap?: SnapInterface
  }
  