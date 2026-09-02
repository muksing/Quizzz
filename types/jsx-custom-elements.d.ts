import type { DetailedHTMLProps, HTMLAttributes } from "react";

type AframeProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  [key: string]: unknown;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "a-scene": AframeProps;
      "a-camera": AframeProps;
      "a-marker": AframeProps;
      "a-entity": AframeProps;
      "a-assets": AframeProps;
      "a-asset-item": AframeProps;
      "a-gltf-model": AframeProps;
      "a-image": AframeProps;
      "a-text": AframeProps;
      "model-viewer": AframeProps;
    }
  }
}

export {};
