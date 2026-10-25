import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { FileText, Link2, Image as ImageIcon, Code2, Plus, LogOut, Trash2 } from 'lucide-react';

// CẤU HÌNH FIREBASE CỦA BẠN
const firebaseConfig = {
  apiKey: "AIzaSyDH_aA8l3esgr2uq-VaPjqV87ted5CZeuA",
  authDomain: "knowledge-vault-1eba0.firebaseapp.com",
  projectId: "knowledge-vault-1eba0",
  storageBucket: "knowledge-vault-1eba0.firebasestorage.app",
  messagingSenderId: "558807391554",
  appId: "1:558807391554:web:8146b0b176ba888fe07cdb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState('Ghi chú');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    const q = query(collection(db, `users/${user.uid}/vault_items`), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vaultItems = [];
      snapshot.forEach((doc) => {
        vaultItems.push({ id: doc.id, ...doc.data() });
      });
      setItems(vaultItems);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
      alert("Lỗi đăng nhập: Vui lòng kiểm tra lại cửa sổ popup.");
    }
  };

  const handleLogout = () => signOut(auth);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !user) return;
    try {
      await addDoc(collection(db, `users/${user.uid}/vault_items`), {
        title: newItemTitle,
        type: newItemType,
        createdAt: serverTimestamp()
      });
      setNewItemTitle('');
    } catch (error) {
      console.error("Lỗi khi thêm:", error);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mục này?")) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/vault_items`, id));
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Liên kết': return <Link2 className="h-5 w-5 text-blue-500" />;
      case 'Hình ảnh': return <ImageIcon className="h-5 w-5 text-purple-500" />;
      case 'Code': return <Code2 className="h-5 w-5 text-green-500" />;
      default: return <FileText className="h-5 w-5 text-amber-500" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
            <span className="text-2xl font-bold text-white">KV</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">KNOWLEDGE VAULT</h1>
          <p className="text-slate-500 mb-8">Đăng nhập để truy cập kho kiến thức của bạn</p>
          <button onClick={handleLogin} className="w-full bg-slate-900 text-white font-medium py-3 px-4 rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-200">
            Đăng nhập bằng Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-white">KV</span>
            </div>
            <h1 className="font-bold text-slate-800 text-lg hidden sm:block">Knowledge Vault</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-right hidden sm:block">
              <p className="font-medium text-slate-700">{user.displayName}</p>
              <p className="text-slate-500 text-xs">{user.email}</p>
            </div>
            <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border border-slate-200" />
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <form onSubmit={handleAddItem} className="bg-white p-2 pl-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-2 mb-8 items-center focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50 transition">
          <input
            type="text"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            placeholder="Lưu trữ kiến thức mới..."
            className="flex-1 bg-transparent border-none outline-none py-2 text-slate-700 placeholder:text-slate-400 w-full"
          />
          <div className="flex w-full sm:w-auto gap-2">
            <select
              value={newItemType}
              onChange={(e) => setNewItemType(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2 outline-none focus:border-indigo-400 font-medium flex-1 sm:flex-none cursor-pointer"
            >
              <option value="Ghi chú">Ghi chú</option>
              <option value="Liên kết">Liên kết</option>
              <option value="Hình ảnh">Hình ảnh</option>
              <option value="Code">Code</option>
            </select>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition font-medium flex items-center justify-center gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Thêm</span>
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 transition group flex justify-between items-start">
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-slate-50 rounded-xl">
                  {getTypeIcon(item.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 line-clamp-2 text-sm">{item.title}</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded mt-2 inline-block uppercase font-medium">{item.type}</span>
                </div>
              </div>
              <button onClick={() => handleDeleteItem(item.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
              Kho lưu trữ trống. Hãy tạo mục mới ở phía trên.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
