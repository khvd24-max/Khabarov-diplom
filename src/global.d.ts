type GPUKernel = ((...args: any[]) => any) & {
  setOutput(output: number[]): GPUKernel;
};

type GPURuntime = {
  createKernel(fn: Function): GPUKernel;
  destroy(): void;
};

declare global {
  interface Window {
    GPU: {
      new (settings?: { mode?: string }): GPURuntime;
    };
  }
}

export {};