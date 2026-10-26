import React, { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } from 'react';
import { signInAnonymously, signInWithCustomToken, onAuthStateChanged, GoogleAuthProvider, GithubAuthProvider, OAuthProvider, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import {
  Folder, FolderPlus, FileText, Link2, Image as ImageIcon, Volume2, Music, Code2, Star, Clock,
  Share2, Trash2, Settings, User, Search, Plus, Upload, LayoutGrid, List, ChevronRight,
  ChevronDown, Sun, Moon, Monitor, HardDrive, ShieldCheck, Globe, Lock, Users, Menu, X, Play,
  Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Disc3, Download, Copy, Check,
  RotateCcw, ExternalLink, Edit3, Eye, MoreVertical, AlertTriangle, CheckCircle2, RefreshCw,
  FolderInput, History, GitCompare, Sparkles, LogOut, Bell, ZoomIn, ZoomOut, ChevronLeft,
  CheckSquare, Square, Terminal, FileCode2, Cloud, CloudOff, ListMusic
} from 'lucide-react';

// ============================================================================
// 1. KHỞI TẠO FIREBASE TỪ FILE CẤU HÌNH ĐÃ TÁCH
// ============================================================================
import { auth, db, appId } from './firebase';

// ============================================================================
// 2. CẤU HÌNH ĐA NGÔN NGỮ LẬP TRÌNH & PHIÊN BẢN THẬT CHO CODE VAULT
// ============================================================================
const CODE_VAULT_LANGUAGES = [
  { key: 'cpp', name: 'C++', category: 'C/C++', extension: '.cpp', executable: true, defaultTemplate: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    int n;\n    if (cin >> n) {\n        cout << "Gia tri n = " << n << "\\n";\n    }\n    return 0;\n}\n`, versions: [{ label: 'C++98', runtime: 'GCC 10.2', piston: { language: 'c++', version: '10.2.0' } }, { label: 'C++17', runtime: 'GCC 10.2', piston: { language: 'c++', version: '10.2.0' } }] },
  { key: 'c', name: 'C', category: 'C/C++', extension: '.c', executable: true, defaultTemplate: `#include <stdio.h>\n\nint main(void) {\n    printf("Knowledge Vault - C Standard\\n");\n    return 0;\n}\n`, versions: [{ label: 'C11', runtime: 'GCC 10.2', piston: { language: 'c', version: '10.2.0' } }] },
  { key: 'python', name: 'Python', category: 'Python', extension: '.py', executable: true, defaultTemplate: `import sys\n\ndef solve():\n    lines = sys.stdin.read().strip().splitlines()\n    print(f"Da doc {len(lines)} dong du lieu:")\n    for line in lines:\n        print("->", line)\n\nif __name__ == "__main__":\n    solve()\n`, versions: [{ label: 'Python 3.10', runtime: 'CPython 3.10.0', piston: { language: 'python', version: '3.10.0' } }] },
  { key: 'javascript', name: 'JavaScript', category: 'Web', extension: '.js', executable: true, defaultTemplate: `// Chay truc tiep voi du lieu STDIN\nconst lines = STDIN.trim().split(/\\s+/);\nconsole.log("So phan tu doc duoc:", lines.length);\nconsole.log("Du lieu:", lines.join(", "));\n`, versions: [{ label: 'ES2022', runtime: 'Node.js 18', piston: { language: 'javascript', version: '18.15.0' } }] },
  { key: 'typescript', name: 'TypeScript', category: 'Web', extension: '.ts', executable: true, defaultTemplate: `interface Edge { to: number; weight: number; }\nconst edge: Edge = { to: 2, weight: 15 };\nconsole.log(\`Canh toi dinh \${edge.to} voi trong so \${edge.weight}\`);\n`, versions: [{ label: 'TypeScript 5.0', runtime: 'TSC 5.0.3', piston: { language: 'typescript', version: '5.0.3' } }] },
  { key: 'html', name: 'HTML', category: 'Web', extension: '.html', executable: false, defaultTemplate: `<!DOCTYPE html>\n<html lang="vi">\n<head>\n  <meta charset="UTF-8" />\n  <title>Knowledge Vault</title>\n</head>\n<body>\n  <h1>Xin chào</h1>\n</body>\n</html>`, versions: [{ label: 'HTML5', runtime: 'W3C HTML5 Spec' }] },
  { key: 'css', name: 'CSS', category: 'Web', extension: '.css', executable: false, defaultTemplate: `:root { --brand: #4f46e5; }\n.card { border-radius: 12px; padding: 1rem; }\n`, versions: [{ label: 'CSS3', runtime: 'W3C CSS3' }] },
  { key: 'java', name: 'Java', category: 'System', extension: '.java', executable: true, defaultTemplate: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Java Ready");\n    }\n}\n`, versions: [{ label: 'Java 17 LTS', runtime: 'OpenJDK 17', piston: { language: 'java', version: '15.0.2' } }] },
  { key: 'csharp', name: 'C#', category: 'System', extension: '.cs', executable: true, defaultTemplate: `using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("C# Ready");\n    }\n}\n`, versions: [{ label: 'C# 10', runtime: '.NET 6.0', piston: { language: 'csharp.net', version: '5.0.201' } }] }
];

function getLanguageByKey(key) {
  return CODE_VAULT_LANGUAGES.find((l) => l.key === key) || CODE_VAULT_LANGUAGES[0];
}

function createSynthesizedWavDataUri(freqBase = 220, durationSec = 16) {
  try {
    const sampleRate = 22050;
    const numSamples = sampleRate * durationSec;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);
    const writeStr = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
    writeStr(0, 'RIFF'); view.setUint32(4, 36 + numSamples * 2, true); writeStr(8, 'WAVE'); writeStr(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true); writeStr(36, 'data'); view.setUint32(40, numSamples * 2, true);
    const chord = [freqBase, freqBase * 1.25, freqBase * 1.5, freqBase * 2];
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate; const f = chord[Math.floor(t / 2) % chord.length]; const env = Math.sin((Math.PI * (t % 2)) / 2);
      const wave = 0.45 * Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(2 * Math.PI * (f * 0.5) * t) + 0.15 * Math.sin(2 * Math.PI * (f * 1.5) * t);
      view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, wave * env * 0.5)) * 32767, true);
    }
    const bytes = new Uint8Array(buffer); let binary = ''; const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    return 'data:audio/wav;base64,' + btoa(binary);
  } catch { return ''; }
}

const SAMPLE_GRAPH_SVG_URI = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 400" width="720" height="400"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e1b4b"/></linearGradient></defs><rect width="720" height="400" rx="20" fill="url(#bg)"/><text x="36" y="46" fill="#e2e8f0" font-family="sans-serif" font-size="20" font-weight="bold">Minh họa Thuật toán Dijkstra — Đường đi ngắn nhất (1 → 4 = 6)</text><line x1="140" y1="210" x2="340" y2="110" stroke="#38bdf8" stroke-width="5"/><line x1="140" y1="210" x2="340" y2="300" stroke="#64748b" stroke-width="3" stroke-dasharray="6,6"/><line x1="340" y1="110" x2="340" y2="300" stroke="#38bdf8" stroke-width="5"/><line x1="340" y1="300" x2="570" y2="210" stroke="#38bdf8" stroke-width="5"/><text x="225" y="145" fill="#38bdf8" font-family="monospace" font-size="18" font-weight="bold">w = 2</text><text x="225" y="280" fill="#94a3b8" font-family="monospace" font-size="16">w = 5</text><text x="355" y="215" fill="#38bdf8" font-family="monospace" font-size="18" font-weight="bold">w = 1</text><text x="465" y="275" fill="#38bdf8" font-family="monospace" font-size="18" font-weight="bold">w = 3</text><circle cx="140" cy="210" r="36" fill="#4f46e5" stroke="#a5b4fc" stroke-width="4"/><text x="140" y="216" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="bold">Đỉnh 1</text><circle cx="340" cy="110" r="36" fill="#0284c7" stroke="#7dd3fc" stroke-width="4"/><text x="340" y="116" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="bold">Đỉnh 2</text><circle cx="340" cy="300" r="36" fill="#0d9488" stroke="#5eead4" stroke-width="4"/><text x="340" y="306" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="bold">Đỉnh 3</text><circle cx="570" cy="210" r="36" fill="#059669" stroke="#6ee7b7" stroke-width="4"/><text x="570" y="216" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="bold">Đỉnh 4</text></svg>`);

function buildInitialVaultSeed(userId, userEmail) {
  const now = new Date().toISOString();
  const wavTrack1 = createSynthesizedWavDataUri(220, 16);
  const wavTrack2 = createSynthesizedWavDataUri(261.63, 16);

  const folders = [
    { id: 'folder-cs', owner_id: userId, parent_id: null, name: 'Tin học', icon: 'code', color: '#4F46E5', cover_url: '', visibility: 'private', is_favorite: true, is_trashed: false, created_at: now, updated_at: now },
    { id: 'folder-cpp', owner_id: userId, parent_id: 'folder-cs', name: 'C++', icon: 'terminal', color: '#2563EB', cover_url: '', visibility: 'private', is_favorite: false, is_trashed: false, created_at: now, updated_at: now },
    { id: 'folder-algo', owner_id: userId, parent_id: 'folder-cpp', name: 'Quy hoạch động & Đồ thị', icon: 'sparkles', color: '#0D9488', cover_url: '', visibility: 'restricted', is_favorite: true, is_trashed: false, created_at: now, updated_at: now },
    { id: 'folder-music', owner_id: userId, parent_id: null, name: 'Âm nhạc & Tập trung', icon: 'music', color: '#DB2777', cover_url: '', visibility: 'private', is_favorite: false, is_trashed: false, created_at: now, updated_at: now }
  ];

  const items = [
    {
      id: 'item-dijkstra-cpp17', owner_id: userId, owner_email: userEmail || 'user@knowledgevault.app', folder_id: 'folder-algo', type: 'code', title: 'Tìm đường đi ngắn nhất trên đồ thị trọng số dương (Shortest Path)', description: 'Bộ 3 lời giải chuẩn: Dijkstra (Min-Heap), Bellman-Ford và Floyd-Warshall kèm bộ test mẫu', cover_url: '', storage_provider: 'internal', size_bytes: 6420, visibility: 'public', share_role: 'viewer', shared_with: [], is_favorite: true, is_trashed: false, tags: ['dijkstra', 'graph', 'c++17', 'shortest-path'], created_at: now, updated_at: now,
      code_project: { problem_statement: 'Cho đồ thị có hướng G = (V, E) gồm N đỉnh và M cạnh có trọng số không âm. Hãy tìm khoảng cách ngắn nhất từ đỉnh 1 đến mọi đỉnh từ 1 đến N. Nếu không tồn tại đường đi tới đỉnh i, in ra -1.', problem_image_url: SAMPLE_GRAPH_SVG_URI, idea_notes: 'Dùng mảng dist[] khởi tạo vô cực (INF = 1e18), dist[1] = 0. Mỗi bước lấy đỉnh u có dist[u] nhỏ nhất chưa tối ưu để nới lỏng (relax) các cạnh kề (u, v, w).', algorithm_notes: 'Sử dụng std::priority_queue<pair<long long, int>, vector<...>, greater<...>> để đạt độ phức tạp tối ưu trên đồ thị thưa.', complexity_notes: 'Time: O((V + E) log V) | Space: O(V + E)', edge_cases_notes: 'Đồ thị không liên thông, nhiều cạnh trùng giữa 2 đỉnh, tổng trọng số vượt kiểu int 32-bit.', personal_notes: 'Luôn kiểm tra if (d != dist[u]) continue; trước khi duyệt danh sách kề.', primary_language: 'cpp', primary_version: 'C++17', solutions: JSON.stringify([{ id: 'sol-1', solution_name: 'Dijkstra (Min-Heap C++17)', language_key: 'cpp', language_version: 'C++17', runtime_env: 'GCC 10.2 (ISO C++17)', code_content: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    int n, m;\n    if (!(cin >> n >> m)) return 0;\n    vector<vector<pair<int, long long>>> adj(n + 1);\n    for (int i = 0; i < m; ++i) {\n        int u, v;\n        long long w;\n        cin >> u >> v >> w;\n        adj[u].push_back({v, w});\n    }\n    const long long INF = (1LL << 60);\n    vector<long long> dist(n + 1, INF);\n    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;\n    dist[1] = 0;\n    pq.push({0, 1});\n    while (!pq.empty()) {\n        auto [d, u] = pq.top();\n        pq.pop();\n        if (d != dist[u]) continue;\n        for (auto [v, w] : adj[u]) {\n            if (dist[u] + w < dist[v]) {\n                dist[v] = dist[u] + w;\n                pq.push({dist[v], v});\n            }\n        }\n    }\n    for (int i = 1; i <= n; ++i) cout << (dist[i] == INF ? -1 : dist[i]) << (i == n ? "" : " ");\n    cout << "\\n";\n    return 0;\n}\n`, solution_notes: 'Lời giải chuẩn C++17 dùng structured bindings auto [d, u].', sample_input: '4 4\n1 2 2\n1 3 5\n2 3 1\n3 4 3', sample_output: '0 2 3 6', last_actual_output: '0 2 3 6\n', last_error_output: '', version_number: 1, updated_at: now }]) }
    },
    {
      id: 'item-note-dag', owner_id: userId, owner_email: userEmail || 'user@knowledgevault.app', folder_id: 'folder-algo', type: 'note', title: 'Sổ tay Quy hoạch động trên Đồ thị DAG & Checklist Ôn tập', description: 'Tổng hợp phương pháp sắp xếp Tô-pô (Topological Sort) kết hợp quy hoạch động trạng thái', cover_url: '', storage_provider: 'internal', size_bytes: 4120, visibility: 'private', share_role: 'viewer', shared_with: [], is_favorite: true, is_trashed: false, tags: ['dp', 'dag', 'toposort', 'dijkstra'], created_at: now, updated_at: now,
      note: { content_text: `1. NGUYÊN LÝ QUY HOẠCH ĐỘNG TRÊN DAG\nMọi đồ thị có hướng không chu trình (DAG) đều tồn tại thứ tự Tô-pô sao cho mọi cạnh (u, v) đều có u đứng trước v.\n\n2. CÔNG THỨC CHUYỂN TRẠNG THÁI\n- Đường đi dài nhất trên DAG: dp[v] = max(dp[v], dp[u] + w(u, v))\n- Đếm số đường đi từ đỉnh 1 tới đỉnh N: ways[v] = (ways[v] + ways[u]) % MOD\n\n3. SO SÁNH VỚI DIJKSTRA\n- Nếu đồ thị là DAG: luôn ưu tiên Topo Sort + DP với độ phức tạp tuyến tính O(V + E).\n- Nếu đồ thị có chu trình và trọng số không âm: dùng Dijkstra O((V + E) log V).`, checklist_json: JSON.stringify([{ id: 'chk-1', text: 'Cài đặt Kahn Algorithm (BFS Indegree) cho Topological Sort', done: true }, { id: 'chk-2', text: 'Cài đặt Dijkstra Min-Heap chuẩn C++17', done: true }, { id: 'chk-3', text: 'Làm bài tập Shortest Routes I & II trên CSES', done: false }]) }
    },
    {
      id: 'item-music-deep-focus', owner_id: userId, owner_email: userEmail || 'user@knowledgevault.app', folder_id: 'folder-music', type: 'music', title: 'Ambient Flow State — Deep Coding Session #1', description: 'Giai điệu Ambient Synth giúp tập trung giải thuật toán và đọc tài liệu kỹ thuật', cover_url: '', storage_provider: 'internal', size_bytes: 705600, visibility: 'private', share_role: 'viewer', shared_with: [], is_favorite: true, is_trashed: false, tags: ['ambient', 'focus', 'coding', 'music'], created_at: now, updated_at: now,
      asset: { url: wavTrack1, mime_type: 'audio/wav', filename: 'ambient-flow-state-01.wav', duration_seconds: 16, artist: 'Knowledge Vault Synth Lab', album_name: 'Deep Work Vol. 1' }
    }
  ];

  const playlists = [{ id: 'playlist-coding-focus', owner_id: userId, name: 'Coding & Algorithm Focus', description: 'Danh sách phát tập trung lập trình', track_ids: ['item-music-deep-focus'], created_at: now, updated_at: now }];
  return { folders, items, playlists };
}

// ============================================================================
// 4. GLOBAL MUSIC PLAYER CONTEXT (PHÁT NHẠC XUYÊN TRANG + ĐĨA NHẠC NỔI XOAY)
// ============================================================================
const MusicPlayerContext = createContext(null);

function MusicPlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [queue, setQueue] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('all');
  const [isWidgetExpanded, setWidgetExpanded] = useState(false);
  const [autoplayNotice, setAutoplayNotice] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto'; audio.volume = 0.85; audioRef.current = audio;
    return () => { audio.pause(); };
  }, []);

  const playTrack = useCallback((track, customQueue) => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (Array.isArray(customQueue) && customQueue.length > 0) setQueue(customQueue);
    else setQueue((prev) => (prev.some((t) => t.id === track.id) ? prev : [...prev, track]));
    setCurrentTrack(track);
    if (audio.src !== track.audioUrl) { audio.src = track.audioUrl; audio.currentTime = 0; }
    audio.play().then(() => { setIsPlaying(true); setAutoplayNotice(false); }).catch(() => { setIsPlaying(false); setAutoplayNotice(true); });
  }, []);

  const nextTrack = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    if (isShuffle && queue.length > 1) {
      const others = queue.filter((t) => t.id !== currentTrack.id);
      const randomTrack = others[Math.floor(Math.random() * others.length)];
      if (randomTrack) playTrack(randomTrack);
      return;
    }
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    if (idx + 1 < queue.length) playTrack(queue[idx + 1]);
    else if (repeatMode === 'all' && queue.length > 0) playTrack(queue[0]);
    else setIsPlaying(false);
  }, [currentTrack, queue, isShuffle, repeatMode, playTrack]);

  const prevTrack = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) { audio.currentTime = 0; return; }
    if (!currentTrack || queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = idx > 0 ? idx - 1 : queue.length - 1;
    playTrack(queue[prevIdx]);
  }, [currentTrack, queue, playTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onLoadedMetadata = () => setDuration(audio.duration || currentTrack?.duration || 16);
    const onEnded = () => {
      if (repeatMode === 'one') { audio.currentTime = 0; audio.play().catch(() => setIsPlaying(false)); }
      else nextTrack();
    };
    audio.addEventListener('timeupdate', onTimeUpdate); audio.addEventListener('loadedmetadata', onLoadedMetadata); audio.addEventListener('ended', onEnded);
    return () => { audio.removeEventListener('timeupdate', onTimeUpdate); audio.removeEventListener('loadedmetadata', onLoadedMetadata); audio.removeEventListener('ended', onEnded); };
  }, [repeatMode, nextTrack, currentTrack]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { audio.play().then(() => { setIsPlaying(true); setAutoplayNotice(false); }).catch(() => { setIsPlaying(false); setAutoplayNotice(true); }); }
  }, [isPlaying, currentTrack]);

  const seekTo = useCallback((sec) => { const audio = audioRef.current; if (!audio) return; audio.currentTime = sec; setCurrentTime(sec); }, []);
  const setVolume = useCallback((val) => { const v = Math.max(0, Math.min(1, val)); setVolumeState(v); if (audioRef.current) audioRef.current.volume = v; }, []);
  const toggleShuffle = useCallback(() => setIsShuffle((p) => !p), []);
  const cycleRepeatMode = useCallback(() => setRepeatMode((p) => (p === 'off' ? 'all' : p === 'all' ? 'one' : 'off')), []);

  return (
    <MusicPlayerContext.Provider value={{ queue, setQueue, currentTrack, isPlaying, currentTime, duration, volume, isShuffle, repeatMode, isWidgetExpanded, autoplayNotice, playTrack, togglePlay, nextTrack, prevTrack, seekTo, setVolume, toggleShuffle, cycleRepeatMode, setWidgetExpanded }}>
      {children}
    </MusicPlayerContext.Provider>
  );
}

function useMusicPlayer() { return useContext(MusicPlayerContext); }

// ============================================================================
// 5. WIDGET ĐĨA NHẠC NỔI XOAY 360° (FLOATING VINYL WIDGET)
// ============================================================================
function formatDuration(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60); const s = Math.floor(sec % 60); return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function FloatingVinylWidget() {
  const { queue, setQueue, currentTrack, isPlaying, currentTime, duration, volume, isShuffle, repeatMode, isWidgetExpanded, autoplayNotice, playTrack, togglePlay, nextTrack, prevTrack, seekTo, setVolume, toggleShuffle, cycleRepeatMode, setWidgetExpanded } = useMusicPlayer();
  const [showQueueList, setShowQueueList] = useState(false);
  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 select-none">
      {!isWidgetExpanded ? (
        <div className="flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-white/95 p-1.5 pr-3.5 shadow-2xl backdrop-blur-md transition-all hover:scale-[1.02] dark:border-slate-700/90 dark:bg-slate-900/95">
          <button type="button" onClick={() => setWidgetExpanded(true)} className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-slate-950 via-slate-800 to-indigo-950 shadow-inner">
            {currentTrack.coverUrl ? <img src={currentTrack.coverUrl} alt={currentTrack.title} className="h-12 w-12 rounded-full object-cover animate-spin" style={{ animationDuration: '7s', animationPlayState: isPlaying ? 'running' : 'paused' }} /> : <Disc3 className="h-7 w-7 text-indigo-400 animate-spin" style={{ animationDuration: '6s', animationPlayState: isPlaying ? 'running' : 'paused' }} />}
            <span className="absolute h-3 w-3 rounded-full border-2 border-slate-900 bg-white" />
          </button>
          <div onClick={() => setWidgetExpanded(true)} className="max-w-[145px] cursor-pointer overflow-hidden">
            <div className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} /><span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{isPlaying ? 'Đang phát' : 'Tạm dừng'}</span></div>
            <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">{currentTrack.title}</p>
          </div>
          <button type="button" onClick={togglePlay} className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow hover:bg-indigo-500">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>
        </div>
      ) : (
        <div className="w-80 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95 sm:w-88">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} /><span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Trình phát nhạc xuyên trang</span></div>
            <button type="button" onClick={() => setWidgetExpanded(false)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronDown className="h-4 w-4" /></button>
          </div>
          {autoplayNotice && <div className="mb-2.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">Trình duyệt yêu cầu thao tác nhấn nút Phát để bắt đầu âm thanh.</div>}
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-950 shadow-md">
              {currentTrack.coverUrl ? <img src={currentTrack.coverUrl} alt={currentTrack.title} className="h-14 w-14 rounded-full object-cover animate-spin" style={{ animationDuration: '7s', animationPlayState: isPlaying ? 'running' : 'paused' }} /> : <Disc3 className="h-8 w-8 text-indigo-400 animate-spin" style={{ animationDuration: '6s', animationPlayState: isPlaying ? 'running' : 'paused' }} />}
              <span className="absolute h-3.5 w-3.5 rounded-full border-2 border-slate-900 bg-white" />
            </div>
            <div className="min-w-0 flex-1"><h4 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{currentTrack.title}</h4><p className="truncate text-xs text-slate-500 dark:text-slate-400">{currentTrack.artist || 'Knowledge Vault Studio'}</p></div>
          </div>
          <div className="mt-3.5">
            <input type="range" min={0} max={duration || 16} step={0.1} value={currentTime} onChange={(e) => seekTo(Number(e.target.value))} className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600 dark:bg-slate-700" />
            <div className="mt-1 flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400"><span>{formatDuration(currentTime)}</span><span>{formatDuration(duration)}</span></div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <button type="button" onClick={toggleShuffle} className={`rounded-lg p-1.5 ${isShuffle ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}><Shuffle className="h-4 w-4" /></button>
            <div className="flex items-center gap-3">
              <button type="button" onClick={prevTrack} className="rounded-full p-1.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"><SkipBack className="h-4 w-4" /></button>
              <button type="button" onClick={togglePlay} className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-500">{isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}</button>
              <button type="button" onClick={nextTrack} className="rounded-full p-1.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"><SkipForward className="h-4 w-4" /></button>
            </div>
            <button type="button" onClick={cycleRepeatMode} className={`rounded-lg p-1.5 ${repeatMode !== 'off' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>{repeatMode === 'one' ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}</button>
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2.5 dark:border-slate-800">
            <Volume2 className="h-4 w-4 text-slate-400" />
            <input type="range" min={0} max={1} step={0.02} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600 dark:bg-slate-700" />
            <button type="button" onClick={() => setShowQueueList((prev) => !prev)} className={`ml-1 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold ${showQueueList ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}><ListMusic className="h-3.5 w-3.5" /> ({queue.length})</button>
          </div>
          {showQueueList && (
            <div className="mt-2.5 max-h-36 space-y-1 overflow-auto rounded-xl border border-slate-100 bg-slate-50/90 p-2 text-xs dark:border-slate-800 dark:bg-slate-800/70">
              <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase text-slate-400"><span>Danh sách chờ ({queue.length} bài)</span></div>
              {queue.map((trk) => (
                <div key={trk.id} onClick={() => playTrack(trk)} className={`flex cursor-pointer items-center justify-between rounded-lg px-2 py-1 ${trk.id === currentTrack.id ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-200/70 dark:hover:bg-slate-700/60'}`}>
                  <span className="truncate">{trk.title}</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setQueue((prev) => prev.filter((t) => t.id !== trk.id)); }} className="ml-2 text-[10px] opacity-75 hover:opacity-100"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 6. COMPONENT CODE VAULT WORKSPACE (ĐA LỜI GIẢI, PHIÊN BẢN, DIFF, CHẠY SANDBOX)
// ============================================================================
function CodeVaultWorkspace({ item, onSaveItem, onBack, showToast }) {
  const project = item.code_project || {};
  const parsedSolutions = useMemo(() => { try { const raw = project.solutions; if (Array.isArray(raw)) return raw; return JSON.parse(raw || '[]'); } catch { return []; } }, [project.solutions]);
  const [solutions, setSolutions] = useState(parsedSolutions.length > 0 ? parsedSolutions : [{ id: 'sol-default', solution_name: 'Lời giải 1', language_key: 'cpp', language_version: 'C++17', runtime_env: 'GCC 10.2 (ISO C++17)', code_content: getLanguageByKey('cpp').defaultTemplate, solution_notes: '', sample_input: '', sample_output: '', last_actual_output: '', last_error_output: '', version_number: 1, updated_at: new Date().toISOString() }]);
  const [activeSolId, setActiveSolId] = useState(solutions[0]?.id || 'sol-default');
  const activeSol = solutions.find((s) => s.id === activeSolId) || solutions[0];
  const [title, setTitle] = useState(item.title);
  const [problemStatement, setProblemStatement] = useState(project.problem_statement || '');
  const [ideaNotes, setIdeaNotes] = useState(project.idea_notes || '');
  const [algorithmNotes, setAlgorithmNotes] = useState(project.algorithm_notes || '');
  const [complexityNotes, setComplexityNotes] = useState(project.complexity_notes || '');
  const [edgeCasesNotes, setEdgeCasesNotes] = useState(project.edge_cases_notes || '');
  const [personalNotes, setPersonalNotes] = useState(project.personal_notes || '');
  const [fontSize, setFontSize] = useState(14);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showFindBar, setShowFindBar] = useState(false);
  const [compareSolId, setCompareSolId] = useState(null);
  const [stdinVal, setStdinVal] = useState(activeSol?.sample_input || '');
  const [stdoutVal, setStdoutVal] = useState(activeSol?.last_actual_output || '');
  const [stderrVal, setStderrVal] = useState(activeSol?.last_error_output || '');
  const [execTimeMs, setExecTimeMs] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const abortControllerRef = useRef(null);

  const langConfig = getLanguageByKey(activeSol?.language_key || 'cpp');
  const lineCount = (activeSol?.code_content || '').split('\n').length;

  const updateActiveSol = (patch) => { setSolutions((prev) => prev.map((s) => s.id === activeSol.id ? { ...s, ...patch, updated_at: new Date().toISOString() } : s )); };

  const handleAddSolutionOrVersion = (asNewVersion) => {
    const newId = 'sol-' + Date.now();
    const nextVer = asNewVersion ? (activeSol.version_number || 1) + 1 : 1;
    const newSol = { id: newId, solution_name: asNewVersion ? `${activeSol.solution_name.replace(/\s*\(v\d+\)$/, '')} (v${nextVer})` : `Lời giải ${solutions.length + 1}`, language_key: activeSol.language_key, language_version: activeSol.language_version, runtime_env: activeSol.runtime_env, code_content: asNewVersion ? activeSol.code_content : langConfig.defaultTemplate, solution_notes: asNewVersion ? activeSol.solution_notes : '', sample_input: stdinVal, sample_output: activeSol.sample_output || '', last_actual_output: '', last_error_output: '', version_number: nextVer, parent_solution_id: asNewVersion ? activeSol.id : null, updated_at: new Date().toISOString() };
    setSolutions((prev) => [...prev, newSol]); setActiveSolId(newId);
    showToast(asNewVersion ? `Đã tạo phiên bản v${nextVer} mới (giữ nguyên bản gốc)` : 'Đã thêm tab lời giải mới');
  };

  const handleSaveWorkspace = async () => {
    const updatedItem = { ...item, title: title.trim() || 'Bài toán Code Vault', size_bytes: JSON.stringify(solutions).length + problemStatement.length, updated_at: new Date().toISOString(), code_project: { ...project, problem_statement: problemStatement, idea_notes: ideaNotes, algorithm_notes: algorithmNotes, complexity_notes: complexityNotes, edge_cases_notes: edgeCasesNotes, personal_notes: personalNotes, primary_language: activeSol.language_key, primary_version: activeSol.language_version, solutions: JSON.stringify(solutions) } };
    await onSaveItem(updatedItem);
  };

  const handleRunCode = async () => {
    if (!activeSol) return;
    if (!langConfig.executable) { setStderrVal(`Định dạng ${langConfig.name} (${langConfig.extension}) là ngôn ngữ đánh dấu/cấu hình, không phải chương trình biên dịch thực thi.`); return; }
    setIsRunning(true); setStdoutVal(''); setStderrVal(''); setExecTimeMs(null);
    const startTime = performance.now();

    if (activeSol.language_key === 'javascript') {
      try {
        const logs = []; const customConsole = { log: (...args) => logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')), error: (...args) => logs.push('[ERROR] ' + args.join(' ')) };
        const runner = new Function('STDIN', 'console', activeSol.code_content); runner(stdinVal, customConsole);
        const elapsed = Math.round(performance.now() - startTime); const out = logs.join('\n') || '(Chương trình chạy thành công, không có dữ liệu in ra stdout)';
        setStdoutVal(out); setExecTimeMs(elapsed); updateActiveSol({ last_actual_output: out, last_error_output: '' }); setIsRunning(false);
        return;
      } catch (jsErr) { setStderrVal(`Runtime Error: ${jsErr.message}`); setIsRunning(false); return; }
    }

    const controller = new AbortController(); abortControllerRef.current = controller;
    const verObj = langConfig.versions.find((v) => v.label === activeSol.language_version) || langConfig.versions[0];
    if (!verObj?.piston) { setStderrVal(`Môi trường thực thi cho ${activeSol.language_version} chưa được cấu hình trên máy chủ Sandbox.`); setIsRunning(false); return; }

    try {
      const response = await fetch('https://emkc.org/api/v2/piston/execute', { method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language: verObj.piston.language, version: verObj.piston.version, files: [{ name: `main${langConfig.extension}`, content: activeSol.code_content }], stdin: stdinVal }) });
      const elapsed = Math.round(performance.now() - startTime); setExecTimeMs(elapsed);
      if (!response.ok) { setStderrVal(`Dịch vụ Sandbox từ chối yêu cầu (HTTP ${response.status}). Hệ thống vẫn bảo toàn đầy đủ mã nguồn.`); setIsRunning(false); return; }
      const data = await response.json(); const compileErr = data.compile?.stderr || ''; const runOut = data.run?.stdout || ''; const runErr = data.run?.stderr || '';
      const combinedErr = [compileErr, runErr].filter(Boolean).join('\n');
      setStdoutVal(runOut); setStderrVal(combinedErr); updateActiveSol({ last_actual_output: runOut, last_error_output: combinedErr });
    } catch (err) {
      if (err.name === 'AbortError') setStderrVal('Đã dừng thực thi chương trình theo yêu cầu người dùng.');
      else setStderrVal(`Không thể kết nối tới máy chủ Sandbox thực thi code (${err.message}). Toàn bộ code đã được giữ an toàn.`);
    } finally { setIsRunning(false); abortControllerRef.current = null; }
  };

  const handleStopExecution = () => { if (abortControllerRef.current) abortControllerRef.current.abort(); };
  const handleDownloadCode = () => { const ext = langConfig.extension; const safeName = title.toLowerCase().replace(/[^a-z0-9_-]+/g, '_').replace(/^_|_$/g, '') || 'solution'; const fileName = ext === 'Dockerfile' ? 'Dockerfile' : `${safeName}${ext}`; const blob = new Blob([activeSol.code_content], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = fileName; a.click(); URL.revokeObjectURL(url); showToast(`Đã tải xuống tệp ${fileName}`); };
  const handleUploadCodeFile = (e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { if (typeof reader.result === 'string') { updateActiveSol({ code_content: reader.result }); showToast(`Đã nhập nội dung từ tệp ${file.name}`); } }; reader.readAsText(file, 'utf-8'); };
  const handleReplaceAll = () => { if (!findText) return; const updatedCode = (activeSol.code_content || '').split(findText).join(replaceText); updateActiveSol({ code_content: updatedCode }); showToast('Đã thay thế toàn bộ từ khóa trong code'); };

  const comparedSolution = solutions.find((s) => s.id === compareSolId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><ChevronLeft className="h-4 w-4" /> Quay lại</button>
          <div className="min-w-0 flex-1">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full truncate bg-transparent text-base font-bold text-slate-900 focus:outline-none dark:text-slate-100" placeholder="Tên bài toán hoặc dự án..." />
            <p className="text-xs text-slate-500 dark:text-slate-400">Ngôn ngữ: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{langConfig.name}</span> • Phiên bản: <span className="font-semibold">{activeSol?.language_version}</span> • Runtime: <span>{activeSol?.runtime_env}</span></p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => handleAddSolutionOrVersion(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" title="Tạo bản sao phiên bản mới mà không ghi đè bản gốc"><History className="h-3.5 w-3.5 text-indigo-500" /> Tạo phiên bản v{(activeSol?.version_number || 1) + 1}</button>
          <button type="button" onClick={handleSaveWorkspace} className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"><CheckCircle2 className="h-4 w-4" /> Lưu bài toán & Lời giải</button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-1.5">
          {solutions.map((sol) => (
            <button key={sol.id} type="button" onClick={() => { setActiveSolId(sol.id); setStdinVal(sol.sample_input || ''); setStdoutVal(sol.last_actual_output || ''); setStderrVal(sol.last_error_output || ''); }} className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${sol.id === activeSol.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}>{sol.solution_name} ({sol.language_version})</button>
          ))}
          <button type="button" onClick={() => handleAddSolutionOrVersion(false)} className="inline-flex items-center gap-1 rounded-xl border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300"><Plus className="h-3.5 w-3.5" /> Thêm lời giải</button>
          {solutions.length > 1 && (
            <select value={compareSolId || ''} onChange={(e) => setCompareSolId(e.target.value || null)} className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <option value="">So sánh phiên bản/lời giải...</option>
              {solutions.filter((s) => s.id !== activeSol.id).map((s) => (<option key={s.id} value={s.id}>So sánh với: {s.solution_name}</option>))}
            </select>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={activeSol?.language_key} onChange={(e) => { const nextLang = getLanguageByKey(e.target.value); const firstVer = nextLang.versions[0]; updateActiveSol({ language_key: nextLang.key, language_version: firstVer.label, runtime_env: firstVer.runtime }); }} className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            {CODE_VAULT_LANGUAGES.map((l) => (<option key={l.key} value={l.key}>{l.name} ({l.extension})</option>))}
          </select>
          <select value={activeSol?.language_version} onChange={(e) => { const ver = langConfig.versions.find((v) => v.label === e.target.value) || langConfig.versions[0]; updateActiveSol({ language_version: ver.label, runtime_env: ver.runtime }); }} className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            {langConfig.versions.map((v) => (<option key={v.label} value={v.label}>{v.label}</option>))}
          </select>
          <select value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800">
            {[12, 13, 14, 16, 18, 20].map((sz) => (<option key={sz} value={sz}>Cỡ chữ {sz}px</option>))}
          </select>
        </div>
      </div>

      {comparedSolution && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/20">
          <div className="mb-2 flex items-center justify-between"><span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300"><GitCompare className="h-4 w-4" /> So sánh trực tiếp: {activeSol.solution_name} vs {comparedSolution.solution_name}</span><button type="button" onClick={() => setCompareSolId(null)} className="text-xs font-semibold text-slate-500 hover:text-rose-600">Đóng so sánh</button></div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <pre className="max-h-56 overflow-auto rounded-xl border border-slate-200 bg-slate-900 p-3 font-mono text-xs text-slate-100">{activeSol.code_content}</pre>
            <pre className="max-h-56 overflow-auto rounded-xl border border-slate-200 bg-slate-900 p-3 font-mono text-xs text-emerald-200">{comparedSolution.code_content}</pre>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Tên lời giải hiện tại</label><input type="text" value={activeSol?.solution_name || ''} onChange={(e) => updateActiveSol({ solution_name: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800" /></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Đề bài (Problem Statement)</label><textarea rows={4} value={problemStatement} onChange={(e) => setProblemStatement(e.target.value)} placeholder="Nhập nội dung đề bài..." className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs leading-relaxed dark:border-slate-700 dark:bg-slate-800" />{project.problem_image_url && (<img src={project.problem_image_url} alt="Minh họa đề bài" className="mt-2 max-h-40 w-full rounded-xl object-contain bg-slate-950 p-1" />)}</div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Ý tưởng & Thuật toán</label><textarea rows={3} value={algorithmNotes} onChange={(e) => setAlgorithmNotes(e.target.value)} placeholder="Mô tả hướng tiếp cận..." className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800" /></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2.5">
            <div><label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Độ phức tạp</label><input type="text" value={complexityNotes} onChange={(e) => setComplexityNotes(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800" /></div>
            <div><label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Trường hợp đặc biệt</label><input type="text" value={edgeCasesNotes} onChange={(e) => setEdgeCasesNotes(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800" /></div>
            <div><label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Ghi chú cá nhân</label><input type="text" value={personalNotes} onChange={(e) => setPersonalNotes(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800" /></div>
          </div>
        </div>
        <div className="flex flex-col gap-3 lg:col-span-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/70">
              <div className="flex flex-wrap items-center gap-1.5">
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><Upload className="h-3.5 w-3.5" /> Nhập tệp<input type="file" onChange={handleUploadCodeFile} className="hidden" /></label>
                <button type="button" onClick={handleDownloadCode} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><Download className="h-3.5 w-3.5" /> Tải xuống</button>
                <button type="button" onClick={() => { navigator.clipboard.writeText(activeSol.code_content || ''); showToast('Đã sao chép'); }} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><Copy className="h-3.5 w-3.5" /> Sao chép</button>
                <button type="button" onClick={() => setShowFindBar(!showFindBar)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><Search className="h-3.5 w-3.5" /> Tìm & Thay thế</button>
              </div>
              <div className="flex items-center gap-2">
                {isRunning ? <button type="button" onClick={handleStopExecution} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"><X className="h-3.5 w-3.5" /> Dừng</button> : <button type="button" onClick={handleRunCode} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500"><Play className="h-3.5 w-3.5" /> Chạy code</button>}
                <button type="button" onClick={handleRunCode} disabled={isRunning} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" title="Chạy lại"><RotateCcw className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            {showFindBar && (
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-100 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800"><input type="text" value={findText} onChange={(e) => setFindText(e.target.value)} placeholder="Tìm kiếm trong code..." className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 dark:border-slate-700 dark:bg-slate-900" /><input type="text" value={replaceText} onChange={(e) => setReplaceText(e.target.value)} placeholder="Thay thế bằng..." className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 dark:border-slate-700 dark:bg-slate-900" /><button type="button" onClick={handleReplaceAll} className="rounded-lg bg-indigo-600 px-2.5 py-1 font-semibold text-white hover:bg-indigo-500">Thay thế tất cả</button></div>
            )}
            <div className="relative flex max-h-[420px] min-h-[340px] overflow-auto bg-slate-950 font-mono text-slate-100">
              <div className="select-none border-r border-slate-800 bg-slate-900/90 px-3 py-3 text-right text-slate-500" style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}>{Array.from({ length: Math.max(1, lineCount) }).map((_, i) => <div key={i}>{i + 1}</div>)}</div>
              <textarea value={activeSol?.code_content || ''} onChange={(e) => updateActiveSol({ code_content: e.target.value })} onKeyDown={(e) => { if (e.key === 'Tab') { e.preventDefault(); const start = e.target.selectionStart; const current = activeSol?.code_content || ''; updateActiveSol({ code_content: current.substring(0, start) + '    ' + current.substring(e.target.selectionEnd) }); setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = start + 4; }, 0); } }} spellCheck={false} style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }} className="w-full flex-1 resize-none bg-transparent p-3 font-mono text-slate-100 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-2 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">INPUT (STDIN)</span><div className="flex items-center gap-2"><button type="button" onClick={() => { updateActiveSol({ sample_input: stdinVal }); showToast('Đã lưu test mẫu'); }} className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400">Lưu test</button><button type="button" onClick={() => setStdinVal('')} className="text-[11px] text-slate-500 hover:text-rose-600">Xóa</button></div></div>
              <textarea rows={4} value={stdinVal} onChange={(e) => setStdinVal(e.target.value)} className="w-full flex-1 rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-800" />
            </div>
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-2 flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">OUTPUT</span>{execTimeMs !== null && <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">{execTimeMs} ms</span>}</div><div className="flex items-center gap-2"><button type="button" onClick={() => { navigator.clipboard.writeText(stdoutVal || stderrVal || ''); showToast('Đã sao chép OUTPUT'); }} className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400">Sao chép</button><button type="button" onClick={() => { setStdoutVal(''); setStderrVal(''); }} className="text-[11px] text-slate-500 hover:text-rose-600">Xóa</button></div></div>
              <div className="min-h-[104px] flex-1 overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-2.5 font-mono text-xs text-slate-100 dark:border-slate-700">{isRunning ? <div className="flex items-center gap-2 text-indigo-400"><RefreshCw className="h-3.5 w-3.5 animate-spin" /><span>Đang biên dịch...</span></div> : stderrVal ? <div className="whitespace-pre-wrap text-rose-400">{stderrVal}</div> : stdoutVal ? <pre className="whitespace-pre-wrap text-emerald-300">{stdoutVal}</pre> : <span className="text-slate-500">Nhấn &ldquo;Chạy code&rdquo; để thực thi chương trình.</span>}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 7. TRÌNH SOẠN THẢO VĂN BẢN & CHECKLIST (NOTES EDITOR WORKSPACE)
// ============================================================================
function NoteEditorWorkspace({ item, onSaveItem, onBack, showToast }) {
  const [title, setTitle] = useState(item.title || '');
  const [description, setDescription] = useState(item.description || '');
  const [contentText, setContentText] = useState(item.note?.content_text || '');
  const [searchInNote, setSearchInNote] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [checklist, setChecklist] = useState(() => { try { const raw = item.note?.checklist_json; return Array.isArray(raw) ? raw : JSON.parse(raw || '[]'); } catch { return []; } });

  const insertFormatting = (prefix, suffix = '') => setContentText((prev) => `${prev}\n${prefix}${suffix}`);
  const handleAddChecklistTask = (e) => { e.preventDefault(); if (!newTaskText.trim()) return; setChecklist((prev) => [...prev, { id: 'chk-' + Date.now(), text: newTaskText.trim(), done: false }]); setNewTaskText(''); };
  const handleSaveNote = async () => { await onSaveItem({ ...item, title: title.trim() || 'Ghi chú không tiêu đề', description, size_bytes: new Blob([contentText]).size + JSON.stringify(checklist).length, updated_at: new Date().toISOString(), note: { content_text: contentText, checklist_json: JSON.stringify(checklist) } }); };
  const handleExportMarkdown = () => { const mdContent = `# ${title}\n\n> ${description}\n\n${contentText}\n\n## Checklist\n${checklist.map((c) => `- [${c.done ? 'x' : ' '}] ${c.text}`).join('\n')}\n`; const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'note'}.md`; a.click(); URL.revokeObjectURL(url); showToast('Đã xuất ghi chú ra tệp Markdown (.md)'); };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200"><ChevronLeft className="h-4 w-4" /> Quay lại kho lưu trữ</button>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative"><Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><input type="text" value={searchInNote} onChange={(e) => setSearchInNote(e.target.value)} placeholder="Tìm trong ghi chú..." className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs dark:border-slate-700 dark:bg-slate-800" /></div>
          <button type="button" onClick={() => { navigator.clipboard.writeText(contentText); showToast('Đã sao chép'); }} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"><Copy className="h-3.5 w-3.5" /> Sao chép</button>
          <button type="button" onClick={handleExportMarkdown} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"><Download className="h-3.5 w-3.5" /> Xuất .MD</button>
          <button type="button" onClick={handleSaveNote} className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"><CheckCircle2 className="h-4 w-4" /> Lưu ghi chú</button>
        </div>
      </div>
      <div className="space-y-2"><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề ghi chú..." className="w-full text-xl font-bold text-slate-900 focus:outline-none dark:bg-transparent dark:text-slate-100" /><input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả ngắn gọn..." className="w-full text-xs text-slate-500 focus:outline-none dark:bg-transparent dark:text-slate-400" /></div>
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800/60">
        {[{ label: 'H1', action: () => insertFormatting('# Tiêu đề cấp 1') }, { label: 'H2', action: () => insertFormatting('## Tiêu đề cấp 2') }, { label: 'H3', action: () => insertFormatting('### Tiêu đề cấp 3') }, { label: 'In đậm', action: () => insertFormatting('**Văn bản in đậm**') }, { label: 'In nghiêng', action: () => insertFormatting('*Văn bản in nghiêng*') }, { label: 'Danh sách', action: () => insertFormatting('- Mục danh sách') }, { label: 'Trích dẫn', action: () => insertFormatting('> Trích dẫn quan trọng') }, { label: 'Khối Code', action: () => insertFormatting('```cpp\n// Code tại đây\n```') }].map((btn) => (<button key={btn.label} type="button" onClick={btn.action} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">{btn.label}</button>))}
      </div>
      {searchInNote && <div className="rounded-xl bg-amber-50 px-3 py-1.5 text-xs text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">Số lần xuất hiện của &ldquo;{searchInNote}&rdquo;: <span className="font-bold">{contentText.toLowerCase().split(searchInNote.toLowerCase()).length - 1}</span></div>}
      <textarea rows={12} value={contentText} onChange={(e) => setContentText(e.target.value)} placeholder="Nhập nội dung ghi chú..." className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm leading-relaxed focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/60" />
      <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">Checklist công việc ({checklist.filter((c) => c.done).length}/{checklist.length})</h4>
        <div className="space-y-2">
          {checklist.map((itemChk) => (
            <div key={itemChk.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
              <button type="button" onClick={() => setChecklist((prev) => prev.map((c) => (c.id === itemChk.id ? { ...c, done: !c.done } : c)))} className="flex items-center gap-2.5 text-left text-xs">{itemChk.done ? <CheckSquare className="h-4 w-4 text-emerald-600" /> : <Square className="h-4 w-4 text-slate-400" />}<span className={itemChk.done ? 'line-through text-slate-400' : 'font-medium'}>{itemChk.text}</span></button>
              <button type="button" onClick={() => setChecklist((prev) => prev.filter((c) => c.id !== itemChk.id))} className="text-slate-400 hover:text-rose-500"><X className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddChecklistTask} className="mt-3 flex gap-2"><input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Thêm mục cần làm vào checklist..." className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800" /><button type="submit" className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">+ Thêm</button></form>
      </div>
    </div>
  );
}

// ============================================================================
// 8. LIGHTBOX XEM ẢNH PHÓNG TO / THU NHỎ / CHUYỂN ẢNH TRƯỚC SAU
// ============================================================================
function ImageLightboxModal({ imageItem, allImages, onClose, onSelectImage }) {
  const [zoom, setZoom] = useState(1);
  if (!imageItem) return null;
  const currentIdx = allImages.findIndex((img) => img.id === imageItem.id);
  const imgUrl = imageItem.asset?.url || imageItem.cover_url || SAMPLE_GRAPH_SVG_URI;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md text-white">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div><h3 className="text-sm font-bold">{imageItem.title}</h3><p className="text-xs text-slate-400">{imageItem.description}</p></div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} className="rounded-lg bg-slate-800 p-2 hover:bg-slate-700"><ZoomOut className="h-4 w-4" /></button>
          <span className="text-xs font-mono">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((z) => Math.min(3, z + 0.25))} className="rounded-lg bg-slate-800 p-2 hover:bg-slate-700"><ZoomIn className="h-4 w-4" /></button>
          <a href={imgUrl} download={imageItem.asset?.filename || 'image.svg'} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold hover:bg-indigo-500">Tải xuống</a>
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-800 p-2 hover:bg-rose-600"><X className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-auto p-6">
        {allImages.length > 1 && <button type="button" onClick={() => { onSelectImage(allImages[(currentIdx - 1 + allImages.length) % allImages.length]); setZoom(1); }} className="absolute left-4 rounded-full bg-slate-800/80 p-3 hover:bg-slate-700"><ChevronLeft className="h-5 w-5" /></button>}
        <img src={imgUrl} alt={imageItem.title} style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease' }} className="max-h-[78vh] max-w-[85vw] rounded-xl object-contain shadow-2xl" />
        {allImages.length > 1 && <button type="button" onClick={() => { onSelectImage(allImages[(currentIdx + 1) % allImages.length]); setZoom(1); }} className="absolute right-4 rounded-full bg-slate-800/80 p-3 hover:bg-slate-700"><ChevronRight className="h-5 w-5" /></button>}
      </div>
    </div>
  );
}

// ============================================================================
// 9. COMPONENT CHÍNH: KNOWLEDGE VAULT APPLICATION
// ============================================================================
function KnowledgeVaultInner() {
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [activeTestPersona, setActiveTestPersona] = useState('owner');
  const [renameFolderTarget, setRenameFolderTarget] = useState(null);
  const [renameFolderText, setRenameFolderText] = useState('');
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [profile, setProfile] = useState({ display_name: 'Kỹ sư Knowledge Vault', email: '', avatar_url: '', cover_url: '', bio: 'Lưu trữ thuật toán, ghi chú nghiên cứu, tài liệu và âm nhạc.', theme_preference: 'light', drive_connected: false, drive_email: '', joined_at: new Date().toISOString() });
  const [themeMode, setThemeMode] = useState('light');
  const isDark = useMemo(() => { if (themeMode === 'dark') return true; if (themeMode === 'light') return false; if (typeof window !== 'undefined') return window.matchMedia('(prefers-color-scheme: dark)').matches; return false; }, [themeMode]);
  
  const [folders, setFolders] = useState([]);
  const [items, setItems] = useState([]);
  const [sharedPublicItems, setSharedPublicItems] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [syncState, setSyncState] = useState('saved');

  const [activeNav, setActiveNav] = useState('dashboard');
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [viewMode, setViewMode] = useState('grid');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  const [openedCodeItem, setOpenedCodeItem] = useState(null);
  const [openedNoteItem, setOpenedNoteItem] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  const [createModalType, setCreateModalType] = useState(null);
  const [shareModalTarget, setShareModalTarget] = useState(null);
  const [moveModalTarget, setMoveModalTarget] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => { setToastMessage(msg); setTimeout(() => setToastMessage((prev) => (prev === msg ? null : prev)), 3200); }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
        else await signInAnonymously(auth);
      } catch {}
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); setAuthReady(true); });
    return () => unsubscribe();
  }, []);

  const seededRef = useRef(false);
  useEffect(() => {
    if (!user) return;
    const unsubFolders = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'folders'), (snap) => { setFolders(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); }, () => setSyncState('error'));
    const unsubItems = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'items'), async (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (list.length === 0 && !seededRef.current) {
        seededRef.current = true; setSyncState('saving');
        const seed = buildInitialVaultSeed(user.uid, user.email);
        try {
          for (const f of seed.folders) await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'folders', f.id), f);
          for (const it of seed.items) await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'items', it.id), it);
          for (const pl of seed.playlists) await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'playlists', pl.id), pl);
          setSyncState('saved');
        } catch { setFolders(seed.folders); setItems(seed.items); setPlaylists(seed.playlists); setSyncState('saved'); }
      } else setItems(list);
    }, () => setSyncState('error'));
    const unsubPlaylists = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'playlists'), (snap) => { setPlaylists(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); }, () => {});
    const unsubProfile = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'profile'), (snap) => {
      const mainDoc = snap.docs.find((d) => d.id === 'main');
      if (mainDoc) { const data = mainDoc.data(); setProfile((prev) => ({ ...prev, ...data })); if (data.theme_preference) setThemeMode(data.theme_preference); }
      else { const initProf = { display_name: user.displayName || 'Chuyên gia Knowledge Vault', email: user.email || `vault-${user.uid.slice(0, 6)}@google-oauth.verified`, avatar_url: user.photoURL || '', cover_url: '', bio: 'Kho lưu trữ kiến thức cá nhân: Code Vault, Ghi chú, Tài liệu & Âm nhạc.', theme_preference: 'light', drive_connected: true, drive_email: user.email || '', joined_at: new Date().toISOString() }; setProfile(initProf); setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), initProf).catch(() => {}); }
    }, () => {});
    const unsubPublicShared = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'shared_items'), (snap) => { setSharedPublicItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); }, () => {});
    return () => { unsubFolders(); unsubItems(); unsubPlaylists(); unsubProfile(); unsubPublicShared(); };
  }, [user]);

  const handleAuthResult = async (result) => {
    if (result.user) {
      const updatedProf = { ...profile, display_name: result.user.displayName || profile.display_name, email: result.user.email || profile.email, avatar_url: result.user.photoURL || profile.avatar_url };
      setProfile(updatedProf);
      await setDoc(doc(db, 'artifacts', appId, 'users', result.user.uid, 'profile', 'main'), updatedProf);
      showToast(`Đã đăng nhập thành công: ${result.user.email || result.user.displayName}`);
    }
  };

  const handleGoogleSignIn = async () => { try { await handleAuthResult(await signInWithPopup(auth, new GoogleAuthProvider())); } catch { showToast('Lỗi đăng nhập Google hoặc bị chặn popup.'); } };
  const handleGithubSignIn = async () => { try { await handleAuthResult(await signInWithPopup(auth, new GithubAuthProvider())); } catch (e) { showToast('Lỗi đăng nhập GitHub: ' + e.message); } };
  const handleDiscordSignIn = async () => { try { await handleAuthResult(await signInWithPopup(auth, new OAuthProvider('discord.com'))); } catch (e) { showToast('Lỗi đăng nhập Discord: ' + e.message); } };

  const handleSaveItemToCloud = async (updatedItem) => {
    if (!user) return; setSyncState('saving');
    try { await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'items', updatedItem.id), updatedItem); if (updatedItem.visibility !== 'private') await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'shared_items', updatedItem.id), updatedItem); setSyncState('saved'); showToast('Đã lưu và đồng bộ dữ liệu thành công'); }
    catch { setSyncState('error'); showToast('Lưu thất bại, vui lòng kiểm tra kết nối mạng'); }
  };

  const canMoveFolderSafely = useCallback((folderId, targetParentId) => {
    if (!targetParentId) return true; if (folderId === targetParentId) return false;
    let cursor = folders.find((f) => f.id === targetParentId) || null;
    while (cursor) { if (cursor.id === folderId) return false; cursor = folders.find((f) => f.id === cursor.parent_id) || null; } return true;
  }, [folders]);

  const breadcrumbs = useMemo(() => { const chain = []; let pointer = folders.find((f) => f.id === currentFolderId) || null; while (pointer) { chain.unshift(pointer); pointer = folders.find((f) => f.id === pointer.parent_id) || null; } return chain; }, [folders, currentFolderId]);

  const stats = useMemo(() => {
    const activeItems = items.filter((i) => !i.is_trashed); const activeFolders = folders.filter((f) => !f.is_trashed); const totalBytes = activeItems.reduce((sum, i) => sum + (Number(i.size_bytes) || 0), 0);
    return { totalItems: activeItems.length, totalFolders: activeFolders.length, notesCount: activeItems.filter((i) => i.type === 'note').length, linksCount: activeItems.filter((i) => i.type === 'link').length, imagesCount: activeItems.filter((i) => i.type === 'image').length, codeCount: activeItems.filter((i) => i.type === 'code').length, audioMusicCount: activeItems.filter((i) => i.type === 'audio' || i.type === 'music').length, totalBytes };
  }, [items, folders]);

  const hasFolderAccessForPersona = useCallback((folderId, persona) => {
    if (!folderId || persona === 'owner') return true;
    let cursor = folders.find((f) => f.id === folderId && !f.is_trashed) || null;
    while (cursor) { if (cursor.visibility === 'public' || cursor.visibility === 'link' || (Array.isArray(cursor.shared_with) && cursor.shared_with.some((s) => s.email?.toLowerCase() === 'guest-b@knowledgevault.app'))) return true; cursor = folders.find((f) => f.id === cursor.parent_id && !f.is_trashed) || null; }
    return false;
  }, [folders]);

  const hasItemAccessForPersona = useCallback((item, persona) => {
    if (!item || item.is_trashed) return false; if (persona === 'owner') return true;
    if (item.visibility === 'public' || item.visibility === 'link' || (Array.isArray(item.shared_with) && item.shared_with.some((s) => s.email?.toLowerCase() === 'guest-b@knowledgevault.app'))) return true;
    if (item.folder_id && hasFolderAccessForPersona(item.folder_id, persona)) return true; return false;
  }, [hasFolderAccessForPersona]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const sourceList = activeNav === 'shared' || activeCategory === 'shared' ? [...items.filter((i) => !i.is_trashed && i.visibility !== 'private'), ...sharedPublicItems.filter((s) => s.owner_id !== user?.uid)] : items;
    return sourceList.filter((item) => {
      if (activeNav === 'trash') return activeTestPersona === 'owner' && item.is_trashed;
      if (item.is_trashed || !hasItemAccessForPersona(item, activeTestPersona)) return false;
      if ((activeNav === 'favorites' || activeCategory === 'favorites') && !item.is_favorite) return false;
      if (currentFolderId && !q && activeNav !== 'shared' && activeNav !== 'favorites' && item.folder_id !== currentFolderId) return false;
      const cat = activeCategory; if (cat === 'note' && item.type !== 'note') return false; if (cat === 'link' && item.type !== 'link') return false; if (cat === 'image' && item.type !== 'image') return false; if (cat === 'audio' && item.type !== 'audio') return false; if (cat === 'music' && item.type !== 'music') return false; if (cat === 'code' && item.type !== 'code') return false; if (cat === 'google_drive' && item.storage_provider !== 'google_drive') return false;
      if (!q) return true;
      return (item.title || '').toLowerCase().includes(q) || (item.description || '').toLowerCase().includes(q) || (item.tags || []).some((t) => t.toLowerCase().includes(q)) || (item.note?.content_text || '').toLowerCase().includes(q) || (item.link?.url || '').toLowerCase().includes(q) || (item.asset?.artist || '').toLowerCase().includes(q) || (item.code_project?.problem_statement || '').toLowerCase().includes(q) || (item.code_project?.primary_version || '').toLowerCase().includes(q) || (typeof item.code_project?.solutions === 'string' && item.code_project.solutions.toLowerCase().includes(q));
    }).sort((a, b) => { if (sortBy === 'name') return (a.title || '').localeCompare(b.title || '', 'vi'); if (sortBy === 'created') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(); if (sortBy === 'type') return (a.type || '').localeCompare(b.type || ''); return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime(); });
  }, [items, sharedPublicItems, user, activeNav, activeCategory, currentFolderId, searchQuery, sortBy, activeTestPersona, hasItemAccessForPersona]);

  const handleToggleFavorite = async (item, e) => { if (e) e.stopPropagation(); await handleSaveItemToCloud({ ...item, is_favorite: !item.is_favorite, updated_at: new Date().toISOString() }); };
  const handleTrashOrRestoreItem = async (item, toTrash, e) => { if (e) e.stopPropagation(); await handleSaveItemToCloud({ ...item, is_trashed: toTrash, updated_at: new Date().toISOString() }); showToast(toTrash ? `Đã chuyển "${item.title}" vào Thùng rác` : `Đã khôi phục "${item.title}"`); };
  const requestPermanentDeleteItem = (item, e) => { if (e) e.stopPropagation(); setConfirmDialog({ title: 'Xóa vĩnh viễn mục lưu trữ?', message: `Mục "${item.title}" sẽ bị xóa vĩnh viễn khỏi Knowledge Vault và không thể khôi phục.`, confirmLabel: 'Xóa vĩnh viễn', danger: true, onConfirm: async () => { if (!user) return; setSyncState('saving'); await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'items', item.id)); setSyncState('saved'); setConfirmDialog(null); showToast('Đã xóa vĩnh viễn mục lưu trữ'); } }); };
  const requestDeleteFolder = (folder, e) => { if (e) e.stopPropagation(); const subFoldersCount = folders.filter((f) => f.parent_id === folder.id && !f.is_trashed).length; const childItemsCount = items.filter((i) => i.folder_id === folder.id && !i.is_trashed).length; setConfirmDialog({ title: `Chuyển thư mục "${folder.name}" vào Thùng rác?`, message: subFoldersCount > 0 || childItemsCount > 0 ? `CẢNH BÁO: Thư mục này đang chứa ${subFoldersCount} thư mục con và ${childItemsCount} mục dữ liệu. Bạn có chắc chắn muốn chuyển vào Thùng rác không?` : `Thư mục "${folder.name}" sẽ được chuyển vào Thùng rác và có thể khôi phục khi cần.`, confirmLabel: 'Chuyển vào Thùng rác', danger: true, onConfirm: async () => { if (!user) return; setSyncState('saving'); await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'folders', folder.id), { ...folder, is_trashed: true, updated_at: new Date().toISOString() }); setSyncState('saved'); setConfirmDialog(null); showToast(`Đã chuyển thư mục "${folder.name}" vào Thùng rác`); } }); };

  const handleDirectFileUpload = (e) => {
    const file = e.target.files?.[0]; if (!file || !user) return;
    const isImg = file.type.startsWith('image/'); const isAud = file.type.startsWith('audio/'); const isCode = /\.(cpp|c|py|js|ts|java|cs|go|rs|php|rb|kt|swift|sql|sh|json|yaml|md)$/i.test(file.name);
    const reader = new FileReader(); setSyncState('saving');
    reader.onload = async () => {
      const now = new Date().toISOString();
      let newItem = { id: 'item-' + Date.now(), owner_id: user.uid, owner_email: profile.email, folder_id: currentFolderId, title: file.name, description: `Tải lên từ thiết bị (${(file.size / 1024).toFixed(1)} KB)`, storage_provider: 'internal', size_bytes: file.size, visibility: 'private', share_role: 'viewer', shared_with: [], is_favorite: false, is_trashed: false, tags: ['uploaded'], created_at: now, updated_at: now };
      if (isImg) { newItem.type = 'image'; newItem.cover_url = typeof reader.result === 'string' ? reader.result : ''; newItem.asset = { url: typeof reader.result === 'string' ? reader.result : '', mime_type: file.type, filename: file.name }; }
      else if (isAud) { newItem.type = 'music'; newItem.asset = { url: typeof reader.result === 'string' ? reader.result : '', mime_type: file.type, filename: file.name, artist: profile.display_name, duration_seconds: 180 }; }
      else if (isCode) { newItem.type = 'code'; newItem.code_project = { problem_statement: `Tệp mã nguồn được tải lên: ${file.name}`, idea_notes: '', algorithm_notes: '', complexity_notes: '', edge_cases_notes: '', personal_notes: '', primary_language: 'cpp', primary_version: 'C++17', solutions: JSON.stringify([{ id: 'sol-' + Date.now(), solution_name: file.name, language_key: 'cpp', language_version: 'C++17', runtime_env: 'GCC 10.2 (ISO C++17)', code_content: typeof reader.result === 'string' ? reader.result : '', solution_notes: '', sample_input: '', sample_output: '', version_number: 1, updated_at: now }]) }; }
      else { newItem.type = 'note'; newItem.note = { content_text: typeof reader.result === 'string' ? reader.result : `Tệp đính kèm: ${file.name}`, checklist_json: '[]' }; }
      await handleSaveItemToCloud(newItem);
    };
    if (isImg || isAud) reader.readAsDataURL(file); else reader.readAsText(file, 'utf-8');
  };

  const handleOpenItem = (item) => {
    if (item.type === 'code') { setOpenedCodeItem(item); setOpenedNoteItem(null); }
    else if (item.type === 'note') { setOpenedNoteItem(item); setOpenedCodeItem(null); }
    else if (item.type === 'image') setLightboxImage(item);
    else if (item.type === 'music' || item.type === 'audio') { const musicItems = items.filter((i) => !i.is_trashed && (i.type === 'music' || i.type === 'audio')).map((m) => ({ id: m.id, title: m.title, artist: m.asset?.artist || 'Knowledge Vault Audio', coverUrl: m.cover_url || null, audioUrl: m.asset?.url || createSynthesizedWavDataUri(220, 16), duration: m.asset?.duration_seconds || 16 })); playTrack({ id: item.id, title: item.title, artist: item.asset?.artist || 'Knowledge Vault Audio', coverUrl: item.cover_url || null, audioUrl: item.asset?.url || createSynthesizedWavDataUri(220, 16), duration: item.asset?.duration_seconds || 16 }, musicItems); showToast(`Đang phát: ${item.title}`); }
    else if (item.type === 'link' && item.link?.url) window.open(item.link.url, '_blank', 'noopener,noreferrer');
  };

  const handleChangeTheme = async (mode) => { setThemeMode(mode); const nextProf = { ...profile, theme_preference: mode }; setProfile(nextProf); if (user) await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), nextProf); };

  const handleExportAllData = () => { const payload = { exported_at: new Date().toISOString(), profile, folders, items, playlists }; const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `knowledge-vault-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url); showToast('Đã xuất toàn bộ dữ liệu cá nhân ra tệp JSON'); };

  const handleImportJsonBackup = (e) => { const file = e.target.files?.[0]; if (!file || !user) return; const reader = new FileReader(); reader.onload = async () => { try { const parsed = JSON.parse(String(reader.result || '{}')); setSyncState('saving'); if (Array.isArray(parsed.folders)) for (const f of parsed.folders) await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'folders', f.id), f); if (Array.isArray(parsed.items)) for (const it of parsed.items) await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'items', it.id), it); setSyncState('saved'); showToast('Đã khôi phục dữ liệu từ bản sao lưu JSON thành công'); } catch { setSyncState('error'); showToast('Tệp JSON không hợp lệ'); } }; reader.readAsText(file, 'utf-8'); };

  const handleExportStandaloneWebHtml = () => { const activeItems = items.filter((i) => !i.is_trashed); const htmlString = `<!DOCTYPE html>\n<html lang="vi">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n<title>KNOWLEDGE VAULT — ${profile.display_name}</title>\n<script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-slate-950 text-slate-100 min-h-screen p-6 font-sans">\n<div class="max-w-5xl mx-auto space-y-6">\n<header class="flex items-center justify-between border-b border-slate-800 pb-4">\n<div>\n<h1 class="text-2xl font-extrabold text-indigo-400">KNOWLEDGE VAULT</h1>\n<p class="text-xs text-slate-400">Chủ sở hữu: ${profile.display_name} (${profile.email}) • Xuất lúc: ${new Date().toLocaleString('vi-VN')}</p>\n</div>\n<span class="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-semibold">${activeItems.length} mục</span>\n</header>\n<div class="grid grid-cols-1 md:grid-cols-2 gap-4">\n${activeItems.map((it) => `<div class="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2"><div class="flex items-center justify-between"><span class="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-xs font-bold uppercase">${it.type}</span></div><h2 class="text-base font-bold text-white">${it.title}</h2><p class="text-xs text-slate-400">${it.description || ''}</p>${it.note?.content_text ? `<pre class="mt-2 p-3 rounded-xl bg-slate-950 text-xs text-slate-200 whitespace-pre-wrap">${it.note.content_text.replace(/</g, '&lt;')}</pre>` : ''}${it.link?.url ? `<a href="${it.link.url}" target="_blank" rel="noopener noreferrer" class="inline-block text-xs text-indigo-400 underline">${it.link.url}</a>` : ''}</div>`).join('\n')}\n</div>\n</div>\n</body>\n</html>`; const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'knowledge-vault-web.html'; a.click(); URL.revokeObjectURL(url); showToast('Đã xuất tệp Web độc lập (.HTML)'); };

  const allImageItems = useMemo(() => items.filter((i) => !i.is_trashed && i.type === 'image'), [items]);

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
        {toastMessage && (<div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl dark:bg-indigo-600"><CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-white" /><span>{toastMessage}</span></div>)}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 lg:px-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)} className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"><Menu className="h-5 w-5" /></button>
            <div onClick={() => { setActiveNav('dashboard'); setActiveCategory('all'); setCurrentFolderId(null); setOpenedCodeItem(null); setOpenedNoteItem(null); }} className="flex cursor-pointer items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 font-extrabold text-white shadow-sm">KV</div><div className="hidden sm:block"><h1 className="text-sm font-extrabold tracking-tight">KNOWLEDGE VAULT</h1><p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Kho lưu trữ kiến thức hợp nhất</p></div></div>
          </div>
          <div className="flex max-w-xl flex-1 items-center"><div className="relative w-full"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setOpenedCodeItem(null); setOpenedNoteItem(null); }} placeholder="Tìm kiếm toàn cục..." className="w-full rounded-xl border border-slate-200 bg-slate-100/90 py-2 pl-10 pr-4 text-xs font-medium focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/90 dark:focus:bg-slate-900" /></div></div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setCreateModalType('note')} className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Tạo mới</span></button>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><Upload className="h-4 w-4 text-indigo-500" /><span className="hidden md:inline">Tải tệp lên</span><input type="file" onChange={handleDirectFileUpload} className="hidden" /></label>
            <div className={`hidden items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold xl:inline-flex ${syncState === 'saved' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : syncState === 'saving' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'}`}>{syncState === 'saved' ? <><Cloud className="h-3.5 w-3.5 text-emerald-500" /> Đã lưu</> : syncState === 'saving' ? <><RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-500" /> Đang lưu...</> : <><CloudOff className="h-3.5 w-3.5 text-rose-500" /> Lưu thất bại</>}</div>
            <button type="button" onClick={() => handleChangeTheme(isDark ? 'light' : 'dark')} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">{isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}</button>
            <button type="button" onClick={() => { setActiveNav('profile'); setOpenedCodeItem(null); setOpenedNoteItem(null); }} className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-indigo-500 bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : (profile.display_name || 'KV').slice(0, 2).toUpperCase()}</button>
          </div>
        </header>

        <div className="mx-auto flex max-w-[1600px]">
          <aside className={`${mobileDrawerOpen ? 'fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-2xl dark:bg-slate-900' : 'hidden'} shrink-0 border-r border-slate-200 p-4 dark:border-slate-800 lg:block lg:w-60`}>
            <nav className="space-y-1 text-xs font-semibold">
              {[{ id: 'dashboard', label: 'Trang chủ', icon: LayoutGrid, cat: 'all' }, { id: 'all', label: 'Tất cả nội dung', icon: Folder, cat: 'all' }, { id: 'note', label: 'Văn bản', icon: FileText, cat: 'note' }, { id: 'link', label: 'Liên kết', icon: Link2, cat: 'link' }, { id: 'image', label: 'Hình ảnh', icon: ImageIcon, cat: 'image' }, { id: 'audio', label: 'Âm thanh', icon: Volume2, cat: 'audio' }, { id: 'music', label: 'Âm nhạc (My Music)', icon: Music, cat: 'music' }, { id: 'code', label: 'Code Vault', icon: Code2, cat: 'code' }, { id: 'folders', label: 'Thư mục', icon: Folder, cat: 'folders' }, { id: 'favorites', label: 'Yêu thích', icon: Star, cat: 'favorites' }, { id: 'shared', label: 'Được chia sẻ với tôi', icon: Share2, cat: 'shared' }, { id: 'trash', label: 'Thùng rác', icon: Trash2, cat: 'all' }, { id: 'profile', label: 'Trang cá nhân', icon: User, cat: 'all' }, { id: 'settings', label: 'Cài đặt', icon: Settings, cat: 'all' }].map((nav) => {
                const Icon = nav.icon; const isActive = activeNav === nav.id;
                return (<button key={nav.id} type="button" onClick={() => { setActiveNav(nav.id); setActiveCategory(nav.cat); setOpenedCodeItem(null); setOpenedNoteItem(null); setMobileDrawerOpen(false); }} className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition ${isActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70'}`}><Icon className="h-4 w-4 shrink-0" /><span className="truncate">{nav.label}</span></button>);
              })}
            </nav>
          </aside>

          <main className="min-w-0 flex-1 p-4 pb-24 lg:p-6">
            {openedCodeItem ? (<CodeVaultWorkspace item={openedCodeItem} onBack={() => setOpenedCodeItem(null)} showToast={showToast} onSaveItem={async (updated) => { await handleSaveItemToCloud(updated); setOpenedCodeItem(updated); }} />) : openedNoteItem ? (<NoteEditorWorkspace item={openedNoteItem} onBack={() => setOpenedNoteItem(null)} showToast={showToast} onSaveItem={async (updated) => { await handleSaveItemToCloud(updated); setOpenedNoteItem(updated); }} />) : activeNav === 'profile' || activeNav === 'settings' ? (
              <div className="mx-auto max-w-4xl space-y-6">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="h-32 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500" />
                  <div className="px-6 pb-6">
                    <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
                      <div className="flex items-end gap-4"><div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-indigo-600 text-2xl font-extrabold text-white shadow-md dark:border-slate-900">{profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : 'KV'}</div><div><h2 className="text-lg font-extrabold">{profile.display_name}</h2><p className="text-xs text-slate-500 dark:text-slate-400">{profile.email} • ID: <span className="font-mono">{user?.uid}</span></p></div></div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={handleGoogleSignIn} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 text-slate-800 px-3.5 py-2 text-xs font-semibold hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"><Globe className="h-4 w-4" /> Đăng nhập Google</button>
                        <button type="button" onClick={handleGithubSignIn} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800"><Users className="h-4 w-4" /> GitHub</button>
                        <button type="button" onClick={handleDiscordSignIn} className="inline-flex items-center gap-1.5 rounded-xl bg-[#5865F2] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#4752C4]"><ShieldCheck className="h-4 w-4" /> Discord</button>
                        <button type="button" onClick={handleExportAllData} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Download className="h-4 w-4" /> Xuất dữ liệu JSON</button>
                      </div>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 dark:border-slate-800 md:grid-cols-2">
                      <div><label className="mb-1 block text-xs font-bold text-slate-500">Tên hiển thị</label><input type="text" value={profile.display_name} onChange={(e) => setProfile((p) => ({ ...p, display_name: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800" /></div>
                      <div><label className="mb-1 block text-xs font-bold text-slate-500">URL Ảnh đại diện</label><input type="text" value={profile.avatar_url || ''} onChange={(e) => setProfile((p) => ({ ...p, avatar_url: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800" /></div>
                    </div>
                    <div className="mt-4 flex justify-end"><button type="button" onClick={async () => { if (!user) return; await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), profile); showToast('Đã cập nhật hồ sơ cá nhân'); }} className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">Lưu thay đổi hồ sơ</button></div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {activeNav === 'dashboard' && !searchQuery && !currentFolderId && (
                  <section className="mb-6 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center gap-3.5"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 font-bold text-white shadow-sm">{(profile.display_name || 'KV').slice(0, 2).toUpperCase()}</div><div><h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Xin chào, {profile.display_name}</h2><p className="text-xs text-slate-500 dark:text-slate-400">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p></div></div>
                      <div className="flex flex-wrap gap-2">{[{ type: 'note', label: 'Tạo ghi chú', icon: FileText }, { type: 'link', label: 'Lưu liên kết', icon: Link2 }, { type: 'code', label: 'Tạo mục code', icon: Code2 }, { type: 'folder', label: 'Tạo thư mục', icon: FolderPlus }].map((qa) => { const Icon = qa.icon; return (<button key={qa.type} type="button" onClick={() => setCreateModalType(qa.type)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><Icon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" /><span>{qa.label}</span></button>); })}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">{[{ label: 'Tổng mục lưu', value: stats.totalItems }, { label: 'Tổng thư mục', value: stats.totalFolders }, { label: 'Ghi chú', value: stats.notesCount }, { label: 'Đoạn code', value: stats.codeCount }].map((card) => (<div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{card.label}</p><p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-100">{card.value}</p></div>))}</div>
                  </section>
                )}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">{[{ id: 'all', label: 'Tất cả' }, { id: 'folders', label: 'Thư mục' }, { id: 'note', label: 'Văn bản' }, { id: 'link', label: 'Liên kết' }, { id: 'code', label: 'Code' }].map((pill) => (<button key={pill.id} type="button" onClick={() => setActiveCategory(pill.id)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${activeCategory === pill.id ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}>{pill.label}</button>))}</div>
                  <div className="flex items-center gap-2"><select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"><option value="updated">Ngày cập nhật</option><option value="created">Ngày tạo</option><option value="name">Tên (A - Z)</option></select><button type="button" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">{viewMode === 'grid' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}</button></div>
                </div>
                <nav className="mb-4 flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200/70 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"><button type="button" onClick={() => setCurrentFolderId(null)} className="hover:text-indigo-600 dark:hover:text-indigo-400">Trang chủ</button>{breadcrumbs.map((bc) => (<React.Fragment key={bc.id}><ChevronRight className="h-3.5 w-3.5 text-slate-400" /><button type="button" onClick={() => setCurrentFolderId(bc.id)} className="text-slate-900 hover:text-indigo-600 dark:text-slate-100">{bc.name}</button></React.Fragment>))}<button type="button" onClick={() => setCreateModalType('folder')} className="ml-auto inline-flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-400"><FolderPlus className="h-3.5 w-3.5" /> + Tạo thư mục</button></nav>
                {(activeCategory === 'all' || activeCategory === 'folders') && activeNav !== 'trash' && (
                  <div className="mb-6"><h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">Thư mục ({folders.filter((f) => !f.is_trashed && f.parent_id === currentFolderId).length})</h3><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{folders.filter((f) => !f.is_trashed && f.parent_id === currentFolderId).map((folder) => (<div key={folder.id} onClick={() => setCurrentFolderId(folder.id)} className="group flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-indigo-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"><div className="flex min-w-0 flex-1 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${folder.color || '#4F46E5'}20`, color: folder.color || '#4F46E5' }}><Folder className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{folder.name}</p></div></div><div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}><button type="button" onClick={() => { setRenameFolderTarget(folder); setRenameFolderText(folder.name); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"><Edit3 className="h-3.5 w-3.5" /></button><button type="button" onClick={() => setMoveModalTarget({ kind: 'folder', data: folder })} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"><FolderInput className="h-4 w-4" /></button><button type="button" onClick={(e) => requestDeleteFolder(folder, e)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"><Trash2 className="h-4 w-4" /></button></div></div>))}</div></div>
                )}
                <div>
                  <div className="mb-2.5 flex items-center justify-between"><h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Mục lưu trữ ({filteredItems.length})</h3></div>
                  {filteredItems.length === 0 ? (<div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900"><p className="text-sm font-bold">Chưa có mục lưu trữ nào</p></div>) : (<div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-2.5'}>{filteredItems.map((item) => (<div key={item.id} onClick={() => handleOpenItem(item)} className="group flex cursor-pointer items-center justify-between gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"><div className="flex min-w-0 flex-1 items-center gap-3.5"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">{item.type === 'code' && <Code2 className="h-5 w-5" />}{item.type === 'note' && <FileText className="h-5 w-5" />}{item.type === 'link' && <Link2 className="h-5 w-5" />}{item.type === 'music' && <Music className="h-5 w-5" />}{item.type === 'image' && <ImageIcon className="h-5 w-5" />}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><h4 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>{item.is_favorite && <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />}</div><p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{item.description}</p><div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]"><span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">{item.type.toUpperCase()}</span></div></div></div><div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}><button type="button" onClick={(e) => handleToggleFavorite(item, e)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-500 dark:hover:bg-slate-800"><Star className={`h-4 w-4 ${item.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} /></button><button type="button" onClick={() => setShareModalTarget(item)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"><Share2 className="h-4 w-4" /></button><button type="button" onClick={() => setMoveModalTarget({ kind: 'item', data: item })} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"><FolderInput className="h-4 w-4" /></button><button type="button" onClick={(e) => handleTrashOrRestoreItem(item, true, e)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"><Trash2 className="h-4 w-4" /></button></div></div>))}</div>)}
                </div>
              </>
            )}
          </main>
        </div>

        {createModalType && <CreateVaultResourceModal initialType={createModalType} folders={folders.filter((f) => !f.is_trashed)} currentFolderId={currentFolderId} user={user} profile={profile} onClose={() => setCreateModalType(null)} onSaveItem={async (newItem) => { await handleSaveItemToCloud(newItem); setCreateModalType(null); if (newItem.type === 'code') setOpenedCodeItem(newItem); if (newItem.type === 'note') setOpenedNoteItem(newItem); }} onSaveFolder={async (newFolder) => { if (!user) return; setSyncState('saving'); await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'folders', newFolder.id), newFolder); setSyncState('saved'); setCreateModalType(null); showToast(`Đã tạo thư mục "${newFolder.name}"`); }} />}
        {shareModalTarget && <SharePermissionModal item={shareModalTarget} onClose={() => setShareModalTarget(null)} showToast={showToast} onSavePermissions={async (updatedItem) => { await handleSaveItemToCloud(updatedItem); setShareModalTarget(null); }} />}
        {moveModalTarget && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold">Di chuyển "{moveModalTarget.data.name || moveModalTarget.data.title}"</h3><button type="button" onClick={() => setMoveModalTarget(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div><div className="max-h-60 space-y-1.5 overflow-auto"><button type="button" onClick={async () => { if (moveModalTarget.kind === 'folder') { const updated = { ...moveModalTarget.data, parent_id: null }; await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'folders', updated.id), updated); } else { await handleSaveItemToCloud({ ...moveModalTarget.data, folder_id: null }); } setMoveModalTarget(null); showToast('Đã di chuyển về thư mục gốc'); }} className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:border-indigo-500 dark:border-slate-700"><LayoutGrid className="h-4 w-4 text-indigo-600" /> Thư mục gốc (Trang chủ)</button>{folders.filter((f) => !f.is_trashed).map((dest) => { const allowed = moveModalTarget.kind === 'item' ? true : canMoveFolderSafely(moveModalTarget.data.id, dest.id); return (<button key={dest.id} type="button" disabled={!allowed} onClick={async () => { if (!allowed) return; if (moveModalTarget.kind === 'folder') { const updated = { ...moveModalTarget.data, parent_id: dest.id }; await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'folders', updated.id), updated); } else { await handleSaveItemToCloud({ ...moveModalTarget.data, folder_id: dest.id }); } setMoveModalTarget(null); showToast(`Đã di chuyển vào thư mục "${dest.name}"`); }} className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold ${allowed ? 'border-slate-200 hover:border-indigo-500 dark:border-slate-700' : 'cursor-not-allowed border-slate-100 opacity-40 dark:border-slate-800'}`}><span className="flex items-center gap-2"><Folder className="h-4 w-4 text-indigo-500" /> {dest.name}</span></button>); })}</div></div></div>)}
        {confirmDialog && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60"><AlertTriangle className="h-5 w-5" /></div><div><h3 className="text-sm font-bold">{confirmDialog.title}</h3><p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{confirmDialog.message}</p></div></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setConfirmDialog(null)} className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Hủy bỏ</button><button type="button" onClick={confirmDialog.onConfirm} className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500">{confirmDialog.confirmLabel || 'Xác nhận'}</button></div></div></div>)}
        {lightboxImage && <ImageLightboxModal imageItem={lightboxImage} allImages={allImageItems} onClose={() => setLightboxImage(null)} onSelectImage={(img) => setLightboxImage(img)} />}
        {renameFolderTarget && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"><div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"><h3 className="text-sm font-bold">Đổi tên thư mục</h3><input type="text" value={renameFolderText} onChange={(e) => setRenameFolderText(e.target.value)} className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800" /><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setRenameFolderTarget(null)} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold">Hủy</button><button type="button" onClick={async () => { if (!user || !renameFolderText.trim()) return; const updated = { ...renameFolderTarget, name: renameFolderText.trim(), updated_at: new Date().toISOString() }; await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'folders', updated.id), updated); setRenameFolderTarget(null); showToast('Đã đổi tên thư mục'); }} className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500">Lưu tên mới</button></div></div></div>)}
      </div>
    </div>
  );
}

// ============================================================================
// 10. MODAL TẠO MỚI NỘI DUNG (GHI CHÚ, LIÊN KẾT, ẢNH, NHẠC, CODE, THƯ MỤC)
// ============================================================================
function CreateVaultResourceModal({ initialType, folders, currentFolderId, user, profile, onClose, onSaveItem, onSaveFolder }) {
  const [type, setType] = useState(initialType || 'note'); const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); const [folderId, setFolderId] = useState(currentFolderId || ''); const [tagsInput, setTagsInput] = useState(''); const [visibility, setVisibility] = useState('private'); const [storageProvider, setStorageProvider] = useState('internal'); const [linkUrl, setLinkUrl] = useState(''); const [siteName, setSiteName] = useState(''); const [langKey, setLangKey] = useState('cpp'); const [langVersion, setLangVersion] = useState('C++17'); const [problemStatement, setProblemStatement] = useState(''); const [artistName, setArtistName] = useState(profile?.display_name || 'Knowledge Vault Artist'); const [mediaDataUrl, setMediaDataUrl] = useState(''); const [mediaFileSize, setMediaFileSize] = useState(0); const [folderColor, setFolderColor] = useState('#4F46E5');

  const handleAutoFetchMetadata = () => { try { const parsed = new URL(linkUrl); const host = parsed.hostname.replace(/^www\./, ''); setSiteName(host); if (!title) { const slug = parsed.pathname.split('/').filter(Boolean).pop() || host; setTitle(`${host.toUpperCase()} — ${slug.replace(/[-_]/g, ' ')}`); } if (!description) setDescription(`Liên kết tham khảo từ ${parsed.origin}`); } catch {} };
  const handleFileSelect = (e) => { const file = e.target.files?.[0]; if (!file) return; setMediaFileSize(file.size); if (!title) setTitle(file.name); const reader = new FileReader(); reader.onload = () => { if (typeof reader.result === 'string') setMediaDataUrl(reader.result); }; reader.readAsDataURL(file); };

  const handleSubmit = async (e) => {
    e.preventDefault(); const now = new Date().toISOString();
    if (type === 'folder') { await onSaveFolder({ id: 'folder-' + Date.now(), owner_id: user?.uid || 'u-1', parent_id: folderId || null, name: title.trim() || 'Thư mục mới', icon: 'folder', color: folderColor, visibility, is_favorite: false, is_trashed: false, created_at: now, updated_at: now }); return; }
    const actualType = type === 'drive' ? 'link' : type; const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    const newItem = { id: 'item-' + Date.now(), owner_id: user?.uid || 'u-1', owner_email: profile?.email || '', folder_id: folderId || null, type: actualType, title: title.trim() || `Mục ${actualType.toUpperCase()} mới`, description: description.trim() || 'Được tạo trong Knowledge Vault', storage_provider: type === 'drive' ? 'google_drive' : storageProvider, size_bytes: mediaFileSize || 2048, visibility, share_role: 'viewer', shared_with: [], is_favorite: false, is_trashed: false, tags, created_at: now, updated_at: now };
    if (actualType === 'note') { newItem.note = { content_text: description || 'Nhập nội dung ghi chú tại đây...', checklist_json: '[]' }; } else if (actualType === 'link') { newItem.link = { url: linkUrl || 'https://drive.google.com', domain: siteName || 'google.com', site_name: siteName || 'External Resource', meta_title: newItem.title, meta_description: newItem.description }; } else if (actualType === 'image') { newItem.cover_url = mediaDataUrl || SAMPLE_GRAPH_SVG_URI; newItem.asset = { url: mediaDataUrl || SAMPLE_GRAPH_SVG_URI, mime_type: 'image/png', filename: newItem.title }; } else if (actualType === 'music' || actualType === 'audio') { newItem.asset = { url: mediaDataUrl || createSynthesizedWavDataUri(240, 16), mime_type: 'audio/wav', filename: newItem.title, artist: artistName, duration_seconds: 16 }; } else if (actualType === 'code') { const langObj = getLanguageByKey(langKey); newItem.code_project = { problem_statement: problemStatement || 'Mô tả đề bài...', idea_notes: '', algorithm_notes: '', complexity_notes: 'Time: O(N log N) | Space: O(N)', edge_cases_notes: '', personal_notes: '', primary_language: langKey, primary_version: langVersion, solutions: JSON.stringify([{ id: 'sol-' + Date.now(), solution_name: 'Lời giải 1', language_key: langKey, language_version: langVersion, runtime_env: langObj.versions[0]?.runtime || 'Standard Runtime', code_content: langObj.defaultTemplate, solution_notes: '', sample_input: '', sample_output: '', version_number: 1, updated_at: now }]) }; }
    await onSaveItem(newItem);
  };
  const selectedLangObj = getLanguageByKey(langKey);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"><div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"><div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800"><h3 className="text-sm font-extrabold uppercase tracking-wider">Tạo mới trong Knowledge Vault</h3><button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div><div className="mb-4 flex flex-wrap gap-1.5">{[{ id: 'note', label: 'Ghi chú' }, { id: 'code', label: 'Code' }, { id: 'link', label: 'Liên kết' }, { id: 'image', label: 'Hình ảnh' }, { id: 'music', label: 'Âm nhạc' }, { id: 'folder', label: 'Thư mục' }].map((tab) => (<button key={tab.id} type="button" onClick={() => setType(tab.id)} className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${type === tab.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{tab.label}</button>))}</div><form onSubmit={handleSubmit} className="space-y-3.5 text-xs"><div><label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">{type === 'folder' ? 'Tên thư mục *' : 'Tên mục lưu trữ *'}</label><input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tiêu đề..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-semibold dark:border-slate-700 dark:bg-slate-800" /></div>{type !== 'folder' && (<div><label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">Mô tả ngắn</label><input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả tóm tắt nội dung..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" /></div>)}{(type === 'link' || type === 'drive') && (<div className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-800"><label className="block font-bold text-slate-600 dark:text-slate-300">URL Website hợp lệ *</label><div className="flex gap-2"><input type="url" required value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800" /><button type="button" onClick={handleAutoFetchMetadata} className="rounded-xl bg-slate-900 px-3 py-1.5 font-semibold text-white dark:bg-white dark:text-slate-900">Lấy Metadata</button></div></div>)}{type === 'code' && (<div className="grid grid-cols-2 gap-2.5 rounded-xl border border-slate-200 p-3 dark:border-slate-800"><div><label className="mb-1 block font-bold">Ngôn ngữ</label><select value={langKey} onChange={(e) => { const nextL = getLanguageByKey(e.target.value); setLangKey(nextL.key); setLangVersion(nextL.versions[0].label); }} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-semibold dark:border-slate-700 dark:bg-slate-800">{CODE_VAULT_LANGUAGES.map((l) => (<option key={l.key} value={l.key}>{l.name} ({l.extension})</option>))}</select></div><div><label className="mb-1 block font-bold">Phiên bản chuẩn</label><select value={langVersion} onChange={(e) => setLangVersion(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-semibold dark:border-slate-700 dark:bg-slate-800">{selectedLangObj.versions.map((v) => (<option key={v.label} value={v.label}>{v.label}</option>))}</select></div><div className="col-span-2"><label className="mb-1 block font-bold">Tóm tắt đề bài</label><textarea rows={2} value={problemStatement} onChange={(e) => setProblemStatement(e.target.value)} placeholder="Nhập đề bài hoặc yêu cầu bài toán..." className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800" /></div></div>)}{(type === 'image' || type === 'music' || type === 'audio') && (<div className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-800"><label className="block font-bold">Chọn tệp từ thiết bị</label><input type="file" onChange={handleFileSelect} className="w-full text-xs" />{type === 'music' && (<div><label className="mb-1 mt-2 block font-bold">Tên nghệ sĩ</label><input type="text" value={artistName} onChange={(e) => setArtistName(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800" /></div>)}</div>)}{type === 'folder' && (<div><label className="mb-1 block font-bold">Màu đại diện thư mục</label><input type="color" value={folderColor} onChange={(e) => setFolderColor(e.target.value)} className="h-9 w-20 cursor-pointer rounded-lg border border-slate-200" /></div>)}<div className="grid grid-cols-2 gap-2.5"><div><label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">Thư mục lưu trữ</label><select value={folderId} onChange={(e) => setFolderId(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-800"><option value="">Thư mục gốc (Trang chủ)</option>{folders.map((f) => (<option key={f.id} value={f.id}>{f.name}</option>))}</select></div><div><label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">Quyền riêng tư</label><select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-800"><option value="private">Chỉ mình tôi</option><option value="restricted">Chia sẻ người cụ thể</option><option value="link">Bất kỳ ai có liên kết</option><option value="public">Công khai</option></select></div></div>{type !== 'folder' && (<div className="grid grid-cols-2 gap-2.5"><div><label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">Thẻ (Tags)</label><input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="dijkstra, note..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800" /></div><div><label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">Phương thức lưu</label><select value={storageProvider} onChange={(e) => setStorageProvider(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800"><option value="internal">Lưu nội bộ</option></select></div></div>)}<div className="flex justify-end gap-2 pt-3"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-50 dark:border-slate-700">Hủy</button><button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-500">Lưu</button></div></form></div></div>
  );
}

// ============================================================================
// 11. MODAL QUẢN LÝ QUYỀN RIÊNG TƯ & CHIA SẺ (4 CHẾ ĐỘ + PHÂN VAI TRÒ)
// ============================================================================
function SharePermissionModal({ item, onClose, onSavePermissions, showToast }) {
  const [visibility, setVisibility] = useState(item.visibility || 'private');
  const [inviteEmail, setInviteEmail] = useState(''); const [inviteRole, setInviteRole] = useState('viewer');
  const [sharedList, setSharedList] = useState(() => { return Array.isArray(item.shared_with) ? item.shared_with : []; });

  const handleAddPerson = (e) => { e.preventDefault(); if (!inviteEmail.trim()) return; setSharedList((prev) => [...prev.filter((p) => p.email.toLowerCase() !== inviteEmail.trim().toLowerCase()), { email: inviteEmail.trim(), role: inviteRole, added_at: new Date().toISOString() }]); setInviteEmail(''); if (visibility === 'private') setVisibility('restricted'); };
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://knowledgevault.app'}/?share=${item.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800"><div><h3 className="text-sm font-bold">Chia sẻ & Quyền riêng tư</h3><p className="truncate text-xs text-slate-500">{item.title}</p></div><button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
        <div className="space-y-2 text-xs"><label className="block font-bold text-slate-500">Chế độ truy cập</label>{[{ id: 'private', label: 'Chỉ mình tôi (Private)' }, { id: 'restricted', label: 'Chia sẻ với người cụ thể' }, { id: 'link', label: 'Bất kỳ ai có liên kết' }, { id: 'public', label: 'Công khai (Public)' }].map((mode) => (<button key={mode.id} type="button" onClick={() => setVisibility(mode.id)} className={`flex w-full items-center justify-between rounded-xl border p-2.5 text-left ${visibility === mode.id ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50' : 'border-slate-200 dark:border-slate-800'}`}><div><p className="font-bold">{mode.label}</p></div>{visibility === mode.id && <Check className="h-4 w-4 text-indigo-600" />}</button>))}</div>
        <form onSubmit={handleAddPerson} className="mt-4 flex gap-1.5 text-xs"><input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Nhập email người nhận..." className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800" /><select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800"><option value="viewer">Người xem</option><option value="commenter">Người nhận xét</option><option value="editor">Người chỉnh sửa</option></select><button type="submit" className="rounded-xl bg-slate-900 px-3 py-1.5 font-semibold text-white dark:bg-white dark:text-slate-900">Thêm</button></form>
        {sharedList.length > 0 && (<div className="mt-3 max-h-32 space-y-1.5 overflow-auto border-t border-slate-100 pt-2.5 text-xs dark:border-slate-800">{sharedList.map((entry) => (<div key={entry.email} className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 dark:bg-slate-800"><span className="truncate font-medium">{entry.email}</span><div className="flex items-center gap-2"><span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{entry.role === 'editor' ? 'Chỉnh sửa' : entry.role === 'commenter' ? 'Nhận xét' : 'Xem'}</span><button type="button" onClick={() => setSharedList((prev) => prev.filter((p) => p.email !== entry.email))} className="text-rose-500 hover:underline">Thu hồi</button></div></div>))}</div>)}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <button type="button" onClick={() => { navigator.clipboard.writeText(shareUrl); showToast('Đã sao chép liên kết chia sẻ'); }} className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"><Copy className="h-3.5 w-3.5" /> Copy link</button>
          <div className="flex gap-2"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold">Đóng</button><button type="button" onClick={() => onSavePermissions({ ...item, visibility, shared_with: sharedList, updated_at: new Date().toISOString() })} className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500">Lưu phân quyền</button></div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 12. EXPORT ROOT APP BỌC TRONG GLOBAL MUSIC PLAYER PROVIDER
// ============================================================================
export default function App() {
  return (
    <MusicPlayerProvider>
      <KnowledgeVaultInner />
      <FloatingVinylWidget />
    </MusicPlayerProvider>
  );
}
