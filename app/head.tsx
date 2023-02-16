export default function Head() {
  return (
    <>
      <title>Disco Stu</title>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1"
      />
      <meta
        prefix="og: http://ogp.me/ns#"
        property="og:title"
        content="Disco Stu - A better way to discover music on Spotify"
      />
      <meta
        prefix="og: http://ogp.me/ns#"
        property="og:image"
        content="https://discostu.app/meta-image.jpg"
      />
      <meta
        prefix="og: http://ogp.me/ns#"
        property="og:url"
        content="https://discostu.app/"
      />
      <link rel="icon" href="/favicon.ico" />
    </>
  );
}
