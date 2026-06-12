/**
 * Runtime patch for react-native-css + NativeWind v5 preview instability.
 *
 * The nativeStyleMapping function can receive undefined values in
 * config.nativeStyleMapping during certain render paths involving
 * TextInput (e.g. inside NumberInput after camera navigation + conditional mount).
 *
 * This causes "path.split is not a function (it is undefined)" at render time.
 *
 * This patch wraps the function defensively. It should be imported as early as possible.
 */

let patched = false;

export function applyReactNativeCssPatches() {
  if (patched) return;
  patched = true;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const stylesModule = require("react-native-css/dist/module/native/styles/index.js");
    const commonjsModule = require("react-native-css/dist/commonjs/native/styles/index.js");

    const patchNativeStyleMapping = (mod: any) => {
      if (!mod || !mod.nativeStyleMapping || mod.nativeStyleMapping.__patched) {
        return;
      }

      const original = mod.nativeStyleMapping;

      mod.nativeStyleMapping = function patchedNativeStyleMapping(config: any, props: any) {
        try {
          return original(config, props);
        } catch (err: any) {
          if (err?.message?.includes("split") || err?.message?.includes("path")) {
            console.warn(
              "[react-native-css patch] Caught non-string path in nativeStyleMapping. " +
                "This is a known preview instability with TextInput/NumberInput. " +
                "Original error suppressed to prevent crash.",
              err
            );
            return props ?? {};
          }
          throw err;
        }
      };

      mod.nativeStyleMapping.__patched = true;
    };

    patchNativeStyleMapping(stylesModule);
    patchNativeStyleMapping(commonjsModule);

    console.log("[react-native-css patch] Defensive patches applied for nativeStyleMapping");
  } catch (e) {
    console.warn("[react-native-css patch] Could not apply patches:", e);
  }
}
