// Dummy stub for local WebGPU model

export class WebGPUDummyModel {
  constructor() {
    // Initialize dummy model
  }

  async predict(input: Float32Array): Promise<Float32Array> {
    // Return dummy output
    return new Float32Array([0]);
  }

  dispose() {
    // Cleanup resources (dummy)
  }
}

export default WebGPUDummyModel;
