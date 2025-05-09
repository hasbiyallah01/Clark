export const extractYouTubeId = (url: any) => {
    let id = null;
    const normalLinkRegex =
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|v\/|.*[?&]v=)([\w-]{11})/;
    const shortLinkRegex = /(?:https?:\/\/)?youtu\.be\/([\w-]{11})/;
    const shortsLinkRegex =
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([\w-]{11})/;

    if (normalLinkRegex.test(url)) {
      id = url.match(normalLinkRegex)?.[1];
    } else if (shortLinkRegex.test(url)) {
      id = url.match(shortLinkRegex)?.[1];
    } else if (shortsLinkRegex.test(url)) {
      id = url.match(shortsLinkRegex)?.[1];
    }

    return id;
  };