export default async function spotifyUserInfo() {
  const res = await fetch(`/api/spotify-get-user-info`);
  const data = await res.json();
  return data;
}
