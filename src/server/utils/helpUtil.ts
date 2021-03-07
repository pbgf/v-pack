const injectReplaceRE = [/<head>/, /<!doctype html>/i]

export function injectScriptToHtml(html: string, script: string) {
  // inject after head or doctype
  for (const re of injectReplaceRE) {
    if (re.test(html)) {
      return html.replace(re, `$&${script}`) // $& => 匹配的子串
    }
  }
  // if no <head> tag or doctype is present, just prepend
  return script + html
}
