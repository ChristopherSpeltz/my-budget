let db;
let budget;

const request = indexedDB.open("budget", budget || 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("budget", { autoIncrement: true });
};

request.onerror = function (e) {
  console.log(`Error occurred! ${e.target.errorCode}`);
};

function checkDatabase() {
  console.log("check db invoked");

  let transaction = db.transaction(["budget"], "readwrite");

  const store = transaction.objectStore("budget");

  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((res) => {
          if (res.length !== 0) {
            transaction = db.transaction(["budget"], "readwrite");

            const currentStore = transaction.objectStore("budget");

            currentStore.clear();
          }
        });
    }
  };
}

request.onsuccess = function (e) {
  console.log("success");
  db = e.target.result;

  if (navigator.onLine) {
    console.log("Online!");
    checkDatabase();
  }
};

const saveRecord = (record) => {
  console.log("Record Saved");
  const transaction = db.transaction(["budget"], "readwrite");

  const store = transaction.objectStore("budget");

  store.add(record);
};

window.addEventListener("online", checkDatabase);
