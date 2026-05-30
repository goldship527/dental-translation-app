class RecorderProcessor extends AudioWorkletProcessor {
  process(inputs, outputs) {
    const input = inputs[0]?.[0];
    const output = outputs[0]?.[0];

    if (output) {
      output.fill(0);
    }

    if (input?.length) {
      const samples = new Float32Array(input.length);
      samples.set(input);
      this.port.postMessage(samples, [samples.buffer]);
    }

    return true;
  }
}

registerProcessor("recorder-processor", RecorderProcessor);
