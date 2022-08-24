/* eslint-disable @typescript-eslint/brace-style */
import axios from 'axios';
// import emitter from '@/stores/mitt';

const DB_NAME = 'railway-indexeddb-epublications_5';
const DB_VERSION = 4; // Use a long long for this value (don't use a float)
const DB_STORE_NAME = 'model_glb';

// 加载数据库
function initDb() {
  if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB.");
    return;
  }

  const request = indexedDB.open(DB_NAME, DB_VERSION);

  return new Promise((resolve, reject) => {
    request.onerror = function () {
      console.log('error: create db error');
      reject();
    };
    request.onupgradeneeded = function (evt: any) {
      evt.currentTarget.result.createObjectStore(DB_STORE_NAME, { keyPath: 'ssn' });
    };
    request.onsuccess = function (evt: any) {
      console.log('onsuccess: create db success ');
      resolve(evt.target.result);
    };
  });
}

// 获取模型
async function getModel(url: string, Id: string | number, number:number = 5) {
  const db: any = await initDb();
  const nameList: any[] = [];
  const dbStore = db.transaction([DB_STORE_NAME], 'readwrite').objectStore(DB_STORE_NAME);
  dbStore.openCursor().onsuccess = (event: { target: { result: any } }) => {
    const cursor = event.target.result;
    if (cursor) {
      nameList.push(cursor.key);
      cursor.continue();
    }
  };
  const getRequest = db.transaction([DB_STORE_NAME], 'readwrite').objectStore(DB_STORE_NAME).get(Id);
  return new Promise((resolve, reject) => {
    // const change = false;
    getRequest.onsuccess = function (event: any) {
      const modelFile = event.target.result;
      // 假如已经有缓存了 直接用缓存
      if (modelFile) {
        resolve(modelFile.blob);
      }
      // 没有缓存 或者有旧的缓存， 这个时候要添加缓存 或者添加新缓存删除旧缓存
      else {
        inputModel(url, Id, nameList, number)
          .then((blob) => {
            resolve(blob);
          })
          .catch(() => {
            reject();
          });
      }
    };
    getRequest.onerror = function (event: any) {
      console.log('error', event);
      reject();
    };
  });
}

// 存入模型
async function inputModel(url: string, newId: string | number, list: any, number:number) {
  const db: any = await initDb();
  const modelResult = await axios.get(url, {
    responseType: 'blob',
    onDownloadProgress: (e: any) => {
      window.dispatchEvent(
        new CustomEvent('loadingProgress', {
          detail: ((e.loaded * 100) / e.total).toFixed(2),
        }),
      );
    },
  });

  if (modelResult.status === 200) {
    const obj: any = {
      ssn: newId,
    };
    obj.blob = new Blob([modelResult.data]);
    let inputRequest: { onsuccess: () => void; onerror: (evt: any) => void };
    if (list.length === 0) {
      inputRequest = db.transaction([DB_STORE_NAME], 'readwrite').objectStore(DB_STORE_NAME).add(obj);
    } else {
      if (list.length >= number + 5) {
        list.forEach((name: string) => {
          db.transaction([DB_STORE_NAME], 'readwrite').objectStore(DB_STORE_NAME).delete(name);
        });
      }

      inputRequest = db.transaction([DB_STORE_NAME], 'readwrite').objectStore(DB_STORE_NAME).put(obj);
    }
    return new Promise((resolve, reject) => {
      inputRequest.onsuccess = function () {
        console.log('glb数据添加成功');
        resolve(obj.blob);
      };
      inputRequest.onerror = function (evt: any) {
        console.log('glb数据添加失败', evt);
        reject();
      };
    });
  }
}

export { getModel, inputModel };
