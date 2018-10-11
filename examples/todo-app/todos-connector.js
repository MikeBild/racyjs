export default ({ todosUrl }) => {
  return {
    load,
    add,
    loadById,
    toogleDone,
    remove,
  };

  async function load() {
    const response = await fetch(`${todosUrl}/_all_docs?include_docs=true`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) throw new Error(response.statusText);

    const data = await response.json();
    return data.rows.map(row => ({
      done: false,
      ...row.doc,
      id: row.doc._id,
      rev: row.doc._rev,
    }));
  }

  async function add(itm) {
    const response = await fetch(`${todosUrl}?include_docs=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itm),
    });
    if (!response.ok) throw new Error(response.statusText);
    return await response.json();
  }

  async function loadById(id) {
    const response = await fetch(`${todosUrl}/${id}?include_docs=true`);
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return { ...data, id: data._id, rev: data._rev };
  }

  async function toogleDone(id) {
    const item = await loadById(id);
    item.done = !item.done;
    const response = await fetch(`${todosUrl}/${id}?include_docs=true`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error(response.statusText);
    const result = response.json();
    return { ...item, ...result };
  }

  async function remove(id) {
    const item = await loadById(id);
    const response = await fetch(`${todosUrl}/${id}?rev=${item.rev}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(response.statusText);
    const result = response.json();
    return { ...item, ...result };
  }
};
