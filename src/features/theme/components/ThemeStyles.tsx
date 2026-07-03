import { customThemeCss } from "../theme.utils";

export function ThemeStyles() {
  return <style id="custom-theme-tokens" dangerouslySetInnerHTML={{ __html: customThemeCss() }} />;
}
