export default (page, pages_total, resourceUrl) => {
  const url = `${resourceUrl}?page=`;
  const links = {};

  if (pages_total > 1) {
    if (page < pages_total) {
      links.last = url + pages_total;
      links.next = url + (page + 1);
    }

    if (page > 1) {
      links.first = `${url}1`;
      links.prev = url + (page - 1);
    }
  }

  return links;
};
