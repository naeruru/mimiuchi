export async function check_update() {
  const response = await fetch('https://github.com/naeruru/mimiuchi/releases/latest')
  const parsed_url = response.url.split('/')
  return parsed_url[parsed_url.length - 1]
}
