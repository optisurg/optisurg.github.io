declare module "*.JPG" {
  const src: import("next/image").StaticImageData;
  export default src;
}
