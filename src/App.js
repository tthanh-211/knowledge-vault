import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  Folder, FileText, Link2, Image as ImageIcon, Music, Code2, 
  Search, Plus, LogOut, LayoutGrid, Trash2 
} from 'lucide-react';

// CẤU HÌNH FIREBASE CỦA BẠN
const firebaseConfig = {
  apiKey: "AIzaSyDH_aA813esgr2uq-VaPjqV87ted5CZeuA",
  authDomain: "knowledge-vault-1eba0.firebaseapp.com",
  projectId: "knowledge-vault-1eba0",
  storageBucket: "knowledge-vault-1eba0.firebasestorage.app",
  messagingSenderId: "558807391554",
  appId: "1:558807391554:web:8146b0b176ba888fe07cdb",
  measurementId: "G-SZ3WQPFLFT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function KnowledgeVault() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState('note');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
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
      alert("Lỗi đăng nhập: Vui lòng kiểm tra lại cấu hình Google Auth.");
      console.error(error);
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
        createdAt: serverTimestamp(),
      });
      setNewItemTitle('');
    } catch (error) {
      alert("Lỗi lưu dữ liệu. Đảm bảo Database của bạn đang ở Test Mode.");
      console.error(error);
    }
  };

  const handleDeleteItem = async (id) => {
    if(window.confirm("Xóa mục này?")) {
      await deleteDoc(doc(db, `users/${user.uid}/vault_items`, id));
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'note': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'link': return <Link2 className="h-5 w-5 text-emerald-500" />;
      case 'code': return <Code2 className="h-5 w-5 text-indigo-500" />;
      case 'music': return <Music className="h-5 w-5 text-rose-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-sans">Đang tải...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold mb-4">KV</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">KNOWLEDGE VAULT</h1>
          <p className="text-slate-500 mb-8">Đăng nhập để truy cập kho kiến thức của bạn</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
          >
            Đăng nhập bằng Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold">KV</div>
          <span className="font-bold tracking-tight">KNOWLEDGE VAULT</span>
        </div>
        
        <nav className="space-y-1 flex-1">
          <button className="w-full flex items-center gap-3 bg-indigo-50 text-indigo-700 px-3 py-2.5 rounded-xl font-medium">
            <LayoutGrid className="h-4 w-4" /> Tổng quan
          </button>
          <button className="w-full flex items-center gap-3 text-slate-600 hover:bg-slate-100 px-3 py-2.5 rounded-xl font-medium transition">
            <Code2 className="h-4 w-4" /> Code Vault
          </button>
        </nav>

        <div className="mt-auto border-t border-slate-200 pt-4 flex items-center gap-3">
          <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user.displayName}</p>
            <button onClick={handleLogout} className="text-xs text-red-500 hover:underline flex items-center gap-1">
              <LogOut className="h-3 w-3" /> Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Kho lưu trữ của tôi</h1>
            <p className="text-sm text-slate-500">Đang lưu trữ bằng dữ liệu thật trên Firebase</p>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Tìm kiếm..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
          </div>
        </header>

        <form onSubmit={handleAddItem} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 mb-8">
          <select 
            value={newItemType} 
            onChange={e => setNewItemType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="note">Ghi chú</option>
            <option value="link">Liên kết</option>
            <option value="code">Code</option>
            <option value="music">Âm nhạc</option>
          </select>
          <input 
            type="text" 
            value={newItemTitle}
            onChange={e => setNewItemTitle(e.target.value)}
            placeholder="Nhập tên tài liệu mới..." 
            className="flex-1 bg-transparent border-none focus:outline-none text-sm"
          />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-indigo-500 transition">
            <Plus className="h-4 w-4" /> Thêm mới
          </button>
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
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded mt-2 inline-block uppercase font-medium">
                    {item.type}
                  </span>
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