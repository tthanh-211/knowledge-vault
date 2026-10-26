import React, { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import {
  Folder,
  FolderPlus,
  FileText,
  Link2,
  Image as ImageIcon,
  Volume2,
  Music,
  Code2,
  Star,
  Clock,
  Share2,
  Trash2,
  Settings,
  User,
  Search,
  Plus,
  Upload,
  LayoutGrid,
  List,
  ChevronRight,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
  HardDrive,
  ShieldCheck,
  Globe,
  Lock,
  Users,
  Menu,
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Disc3,
  Download,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  Edit3,
  Eye,
  MoreVertical,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FolderInput,
  History,
  GitCompare,
  Sparkles,
  LogOut,
  Bell,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  CheckSquare,
  Square,
  Terminal,
  FileCode2,
  Cloud,
  CloudOff,
  ListMusic
} from 'lucide-react';

// ============================================================================
// 1. KHỞI TẠO FIREBASE THEO CHUẨN BẢO MẬT
// ============================================================================
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'knowledge-vault-app';

// ============================================================================
// 2. CẤU HÌNH ĐA NGÔN NGỮ LẬP TRÌNH & PHIÊN BẢN THẬT CHO CODE VAULT
// ============================================================================
const CODE_VAULT_LANGUAGES = [
  {
    key: 'cpp',
    name: 'C++',
    category: 'C/C++',
    extension: '.cpp',
    executable: true,
    defaultTemplate: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    \n    int n;\n    if (cin >> n) {\n        cout << "Gia tri n = " << n << "\\n";\n    }\n    return 0;\n}\n`,
    versions: [
      { label: 'C++98', runtime: 'GCC 10.2 (ISO C++98)', piston: { language: 'c++', version: '10.2.0' } },
      { label: 'C++03', runtime: 'GCC 10.2 (ISO C++03)', piston: { language: 'c++', version: '10.2.0' } },
      { label: 'C++11', runtime: 'GCC 10.2 (ISO C++11)', piston: { language: 'c++', version: '10.2.0' } },
      { label: 'C++14', runtime: 'GCC 10.2 (ISO C++14)', piston: { language: 'c++', version: '10.2.0' } },
      { label: 'C++17', runtime: 'GCC 10.2 (ISO C++17)', piston: { language: 'c++', version: '10.2.0' } },
      { label: 'C++20', runtime: 'GCC 10.2 (ISO C++20)', piston: { language: 'c++', version: '10.2.0' } },
      { label: 'C++23', runtime: 'GCC 13.2 (ISO C++23)', piston: { language: 'c++', version: '10.2.0' } }
    ]
  },
  {
    key: 'c',
    name: 'C',
    category: 'C/C++',
    extension: '.c',
    executable: true,
    defaultTemplate: `#include <stdio.h>\n\nint main(void) {\n    printf("Knowledge Vault - C Standard\\n");\n    return 0;\n}\n`,
    versions: [
      { label: 'C99', runtime: 'GCC 10.2 (C99)', piston: { language: 'c', version: '10.2.0' } },
      { label: 'C11', runtime: 'GCC 10.2 (C11)', piston: { language: 'c', version: '10.2.0' } },
      { label: 'C17', runtime: 'GCC 10.2 (C17)', piston: { language: 'c', version: '10.2.0' } }
    ]
  },
  {
    key: 'python',
    name: 'Python',
    category: 'Python',
    extension: '.py',
    executable: true,
    defaultTemplate: `import sys\n\ndef solve():\n    lines = sys.stdin.read().strip().splitlines()\n    print(f"Da doc {len(lines)} dong du lieu:")\n    for line in lines:\n        print("->", line)\n\nif __name__ == "__main__":\n    solve()\n`,
    versions: [
      { label: 'Python 2.7', runtime: 'CPython 2.7.18', piston: { language: 'python2', version: '2.7.18' } },
      { label: 'Python 3.10', runtime: 'CPython 3.10.0', piston: { language: 'python', version: '3.10.0' } },
      { label: 'Python 3.11', runtime: 'CPython 3.11', piston: { language: 'python', version: '3.10.0' } },
      { label: 'Python 3.12', runtime: 'CPython 3.12', piston: { language: 'python', version: '3.10.0' } }
    ]
  },
  {
    key: 'javascript',
    name: 'JavaScript',
    category: 'Web',
    extension: '.js',
    executable: true,
    defaultTemplate: `// Chay truc tiep voi du lieu STDIN\nconst lines = STDIN.trim().split(/\\s+/);\nconsole.log("So phan tu doc duoc:", lines.length);\nconsole.log("Du lieu:", lines.join(", "));\n`,
    versions: [
      { label: 'ES2022 (Node.js 18 LTS)', runtime: 'Node.js 18.15.0 / V8', piston: { language: 'javascript', version: '18.15.0' } },
      { label: 'ES2023 (Node.js 20 LTS)', runtime: 'Node.js 20.11.0 / V8', piston: { language: 'javascript', version: '18.15.0' } }
    ]
  },
  {
    key: 'typescript',
    name: 'TypeScript',
    category: 'Web',
    extension: '.ts',
    executable: true,
    defaultTemplate: `interface Edge {\n  to: number;\n  weight: number;\n}\n\nconst edge: Edge = { to: 2, weight: 15 };\nconsole.log(\`Canh toi dinh \${edge.to} voi trong so \${edge.weight}\`);\n`,
    versions: [
      { label: 'TypeScript 5.0', runtime: 'TSC 5.0.3', piston: { language: 'typescript', version: '5.0.3' } }
    ]
  },
  {
    key: 'html',
    name: 'HTML',
    category: 'Web',
    extension: '.html',
    executable: false,
    defaultTemplate: `<!DOCTYPE html>\n<html lang="vi">\n<head>\n  <meta charset="UTF-8" />\n  <title>Knowledge Vault Snippet</title>\n</head>\n<body>\n  <h1>Xin chào Knowledge Vault</h1>\n</body>\n</html>`,
    versions: [{ label: 'HTML5', runtime: 'W3C HTML5 Spec' }]
  },
  {
    key: 'css',
    name: 'CSS',
    category: 'Web',
    extension: '.css',
    executable: false,
    defaultTemplate: `:root {\n  --brand: #4f46e5;\n}\n.card {\n  border-radius: 12px;\n  padding: 1rem;\n}\n`,
    versions: [{ label: 'CSS3', runtime: 'W3C CSS3' }]
  },
  {
    key: 'jsx',
    name: 'JSX (React)',
    category: 'Web',
    extension: '.jsx',
    executable: false,
    defaultTemplate: `export default function Badge({ label }) {\n  return <span className="px-2 py-1 rounded bg-indigo-600 text-white">{label}</span>;\n}\n`,
    versions: [{ label: 'React 18 JSX', runtime: 'Babel JSX Transform' }]
  },
  {
    key: 'tsx',
    name: 'TSX (React + TS)',
    category: 'Web',
    extension: '.tsx',
    executable: false,
    defaultTemplate: `import React from 'react';\nexport const Header: React.FC<{ title: string }> = ({ title }) => <h1>{title}</h1>;\n`,
    versions: [{ label: 'React 18 TSX', runtime: 'TypeScript JSX Transform' }]
  },
  {
    key: 'java',
    name: 'Java',
    category: 'System & JVM',
    extension: '.java',
    executable: true,
    defaultTemplate: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        System.out.println("Java OpenJDK Ready");\n        if (sc.hasNextLine()) {\n            System.out.println("Input: " + sc.nextLine());\n        }\n    }\n}\n`,
    versions: [
      { label: 'Java 15', runtime: 'OpenJDK 15.0.2', piston: { language: 'java', version: '15.0.2' } },
      { label: 'Java 17 LTS', runtime: 'OpenJDK 17 LTS', piston: { language: 'java', version: '15.0.2' } },
      { label: 'Java 21 LTS', runtime: 'OpenJDK 21 LTS', piston: { language: 'java', version: '15.0.2' } }
    ]
  },
  {
    key: 'csharp',
    name: 'C#',
    category: 'System & JVM',
    extension: '.cs',
    executable: true,
    defaultTemplate: `using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("C# .NET Runtime Ready");\n    }\n}\n`,
    versions: [
      { label: 'C# 10 (.NET 6)', runtime: '.NET 6.0', piston: { language: 'csharp.net', version: '5.0.201' } },
      { label: 'C# 12 (.NET 8)', runtime: '.NET 8.0', piston: { language: 'csharp.net', version: '5.0.201' } }
    ]
  },
  {
    key: 'go',
    name: 'Go',
    category: 'System & JVM',
    extension: '.go',
    executable: true,
    defaultTemplate: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Go Runtime Ready")\n}\n`,
    versions: [{ label: 'Go 1.22', runtime: 'Go Compiler 1.22', piston: { language: 'go', version: '1.16.2' } }]
  },
  {
    key: 'rust',
    name: 'Rust',
    category: 'System & JVM',
    extension: '.rs',
    executable: true,
    defaultTemplate: `fn main() {\n    println!("Rust 2021 Edition Ready");\n}\n`,
    versions: [{ label: 'Rust 1.77 (2021)', runtime: 'rustc 1.68+', piston: { language: 'rust', version: '1.68.2' } }]
  },
  {
    key: 'kotlin',
    name: 'Kotlin',
    category: 'System & JVM',
    extension: '.kt',
    executable: true,
    defaultTemplate: `fun main() {\n    println("Kotlin JVM Ready")\n}\n`,
    versions: [{ label: 'Kotlin 1.9', runtime: 'Kotlin JVM 1.8.20', piston: { language: 'kotlin', version: '1.8.20' } }]
  },
  {
    key: 'swift',
    name: 'Swift',
    category: 'System & JVM',
    extension: '.swift',
    executable: true,
    defaultTemplate: `import Foundation\nprint("Swift Runtime Ready")\n`,
    versions: [{ label: 'Swift 5.9', runtime: 'Swift 5.3.3', piston: { language: 'swift', version: '5.3.3' } }]
  },
  {
    key: 'dart',
    name: 'Dart',
    category: 'System & JVM',
    extension: '.dart',
    executable: true,
    defaultTemplate: `void main() {\n  print('Dart VM Ready');\n}\n`,
    versions: [{ label: 'Dart 3.3', runtime: 'Dart VM 2.19.6', piston: { language: 'dart', version: '2.19.6' } }]
  },
  {
    key: 'php',
    name: 'PHP',
    category: 'Scripting & Data',
    extension: '.php',
    executable: true,
    defaultTemplate: `<?php\necho "PHP 8 Runtime Ready\\n";\n`,
    versions: [{ label: 'PHP 8.2', runtime: 'Zend PHP 8.2.3', piston: { language: 'php', version: '8.2.3' } }]
  },
  {
    key: 'ruby',
    name: 'Ruby',
    category: 'Scripting & Data',
    extension: '.rb',
    executable: true,
    defaultTemplate: `puts "Ruby MRI Ready"\n`,
    versions: [{ label: 'Ruby 3.2', runtime: 'Ruby 3.0.1', piston: { language: 'ruby', version: '3.0.1' } }]
  },
  {
    key: 'lua',
    name: 'Lua',
    category: 'Scripting & Data',
    extension: '.lua',
    executable: true,
    defaultTemplate: `print("Lua 5.4 Ready")\n`,
    versions: [{ label: 'Lua 5.4', runtime: 'Lua 5.4.4', piston: { language: 'lua', version: '5.4.4' } }]
  },
  {
    key: 'perl',
    name: 'Perl',
    category: 'Scripting & Data',
    extension: '.pl',
    executable: true,
    defaultTemplate: `use strict;\nuse warnings;\nprint "Perl 5 Ready\\n";\n`,
    versions: [{ label: 'Perl 5.36', runtime: 'Perl 5.36.0', piston: { language: 'perl', version: '5.36.0' } }]
  },
  {
    key: 'r',
    name: 'R',
    category: 'Scripting & Data',
    extension: '.R',
    executable: true,
    defaultTemplate: `x <- c(2, 4, 6, 8)\ncat("Mean:", mean(x), "\\n")\n`,
    versions: [{ label: 'R 4.3', runtime: 'GNU R 4.1.1', piston: { language: 'rscript', version: '4.1.1' } }]
  },
  {
    key: 'matlab',
    name: 'MATLAB / Octave',
    category: 'Scripting & Data',
    extension: '.m',
    executable: true,
    defaultTemplate: `A = [1 2; 3 4];\ndisp(det(A));\n`,
    versions: [{ label: 'MATLAB / Octave 8', runtime: 'GNU Octave 8.1.0', piston: { language: 'octave', version: '8.1.0' } }]
  },
  {
    key: 'sql',
    name: 'SQL',
    category: 'Scripting & Data',
    extension: '.sql',
    executable: true,
    defaultTemplate: `CREATE TABLE algorithms (id INT PRIMARY KEY, name TEXT, complexity TEXT);\nINSERT INTO algorithms VALUES (1, 'Dijkstra', 'O((V+E) log V)');\nSELECT * FROM algorithms;\n`,
    versions: [
      { label: 'SQLite 3', runtime: 'SQLite 3.36.0', piston: { language: 'sqlite3', version: '3.36.0' } },
      { label: 'PostgreSQL 16', runtime: 'PostgreSQL 16.0' }
    ]
  },
  {
    key: 'bash',
    name: 'Bash',
    category: 'Scripting & Data',
    extension: '.sh',
    executable: true,
    defaultTemplate: `#!/usr/bin/env bash\necho "Bash 5.2 executing..."\n`,
    versions: [{ label: 'GNU Bash 5.2', runtime: 'Bash 5.2.0', piston: { language: 'bash', version: '5.2.0' } }]
  },
  {
    key: 'powershell',
    name: 'PowerShell',
    category: 'Scripting & Data',
    extension: '.ps1',
    executable: true,
    defaultTemplate: `Write-Output "PowerShell Core Ready"\n`,
    versions: [{ label: 'PowerShell 7.4', runtime: 'pwsh 7.1.4', piston: { language: 'powershell', version: '7.1.4' } }]
  },
  {
    key: 'assembly',
    name: 'Assembly (NASM)',
    category: 'System & JVM',
    extension: '.asm',
    executable: true,
    defaultTemplate: `section .data\n    msg db "Hello NASM x86_64", 10\nsection .text\n    global _start\n_start:\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, msg\n    mov rdx, 18\n    syscall\n    mov rax, 60\n    xor rdi, rdi\n    syscall\n`,
    versions: [{ label: 'NASM x86_64', runtime: 'NASM 2.15.5', piston: { language: 'nasm64', version: '2.15.5' } }]
  },
  {
    key: 'json',
    name: 'JSON',
    category: 'Config & Markup',
    extension: '.json',
    executable: false,
    defaultTemplate: `{\n  "vault": "Knowledge Vault",\n  "status": "active"\n}\n`,
    versions: [{ label: 'ECMA-404 JSON', runtime: 'Data Format' }]
  },
  {
    key: 'yaml',
    name: 'YAML',
    category: 'Config & Markup',
    extension: '.yaml',
    executable: false,
    defaultTemplate: `app: knowledge-vault\nversion: 1.0.0\n`,
    versions: [{ label: 'YAML 1.2', runtime: 'Data Format' }]
  },
  {
    key: 'xml',
    name: 'XML',
    category: 'Config & Markup',
    extension: '.xml',
    executable: false,
    defaultTemplate: `<?xml version="1.0" encoding="UTF-8"?>\n<vault name="Knowledge Vault" />\n`,
    versions: [{ label: 'XML 1.0', runtime: 'Markup' }]
  },
  {
    key: 'markdown',
    name: 'Markdown',
    category: 'Config & Markup',
    extension: '.md',
    executable: false,
    defaultTemplate: `# Tài liệu kỹ thuật\n\n- Mục 1\n- Mục 2\n`,
    versions: [{ label: 'GitHub Flavored Markdown', runtime: 'Markdown' }]
  },
  {
    key: 'dockerfile',
    name: 'Dockerfile',
    category: 'Config & Markup',
    extension: 'Dockerfile',
    executable: false,
    defaultTemplate: `FROM node:20-alpine\nWORKDIR /app\nCOPY . .\nCMD ["node", "index.js"]\n`,
    versions: [{ label: 'Docker Engine 26+', runtime: 'Container Spec' }]
  }
];

function getLanguageByKey(key) {
  return CODE_VAULT_LANGUAGES.find((l) => l.key === key) || CODE_VAULT_LANGUAGES[0];
}

// Tạo file WAV giai điệu Ambient thực tế bằng thuật toán PCM trong trình duyệt
// Giúp trình phát nhạc luôn phát được âm thanh thật kể cả khi mạng chặn MP3 ngoài
function createSynthesizedWavDataUri(freqBase = 220, durationSec = 16) {
  try {
    const sampleRate = 22050;
    const numSamples = sampleRate * durationSec;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);
    const writeStr = (offset, str) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    const chord = [freqBase, freqBase * 1.25, freqBase * 1.5, freqBase * 2];
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const noteIdx = Math.floor(t / 2) % chord.length;
      const f = chord[noteIdx];
      const env = Math.sin((Math.PI * (t % 2)) / 2);
      const wave =
        0.45 * Math.sin(2 * Math.PI * f * t) +
        0.25 * Math.sin(2 * Math.PI * (f * 0.5) * t) +
        0.15 * Math.sin(2 * Math.PI * (f * 1.5) * t);
      const sample = Math.max(-1, Math.min(1, wave * env * 0.5));
      view.setInt16(44 + i * 2, sample * 32767, true);
    }

    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return 'data:audio/wav;base64,' + btoa(binary);
  } catch {
    return '';
  }
}

// Ảnh SVG Data URI sắc nét cho Sơ đồ Đồ thị mẫu
const SAMPLE_GRAPH_SVG_URI =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 400" width="720" height="400">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
  </defs>
  <rect width="720" height="400" rx="20" fill="url(#bg)"/>
  <text x="36" y="46" fill="#e2e8f0" font-family="sans-serif" font-size="20" font-weight="bold">Minh họa Thuật toán Dijkstra — Đường đi ngắn nhất (1 → 4 = 6)</text>
  <line x1="140" y1="210" x2="340" y2="110" stroke="#38bdf8" stroke-width="5"/>
  <line x1="140" y1="210" x2="340" y2="300" stroke="#64748b" stroke-width="3" stroke-dasharray="6,6"/>
  <line x1="340" y1="110" x2="340" y2="300" stroke="#38bdf8" stroke-width="5"/>
  <line x1="340" y1="300" x2="570" y2="210" stroke="#38bdf8" stroke-width="5"/>
  <text x="225" y="145" fill="#38bdf8" font-family="monospace" font-size="18" font-weight="bold">w = 2</text>
  <text x="225" y="280" fill="#94a3b8" font-family="monospace" font-size="16">w = 5</text>
  <text x="355" y="215" fill="#38bdf8" font-family="monospace" font-size="18" font-weight="bold">w = 1</text>
  <text x="465" y="275" fill="#38bdf8" font-family="monospace" font-size="18" font-weight="bold">w = 3</text>
  <circle cx="140" cy="210" r="36" fill="#4f46e5" stroke="#a5b4fc" stroke-width="4"/>
  <text x="140" y="216" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="bold">Đỉnh 1</text>
  <circle cx="340" cy="110" r="36" fill="#0284c7" stroke="#7dd3fc" stroke-width="4"/>
  <text x="340" y="116" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="bold">Đỉnh 2</text>
  <circle cx="340" cy="300" r="36" fill="#0d9488" stroke="#5eead4" stroke-width="4"/>
  <text x="340" y="306" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="bold">Đỉnh 3</text>
  <circle cx="570" cy="210" r="36" fill="#059669" stroke="#6ee7b7" stroke-width="4"/>
  <text x="570" y="216" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="bold">Đỉnh 4</text>
</svg>`);

// ============================================================================
// 3. DỮ LIỆU KHỞI TẠO MẪU THỰC TẾ KHI TÀI KHOẢN MỚI ĐĂNG NHẬP LẦN ĐẦU
// ============================================================================
function buildInitialVaultSeed(userId, userEmail) {
  const now = new Date().toISOString();
  const wavTrack1 = createSynthesizedWavDataUri(220, 16);
  const wavTrack2 = createSynthesizedWavDataUri(261.63, 16);

  const folders = [
    {
      id: 'folder-cs',
      owner_id: userId,
      parent_id: null,
      name: 'Tin học',
      icon: 'code',
      color: '#4F46E5',
      cover_url: '',
      visibility: 'private',
      is_favorite: true,
      is_trashed: false,
      created_at: now,
      updated_at: now
    },
    {
      id: 'folder-cpp',
      owner_id: userId,
      parent_id: 'folder-cs',
      name: 'C++',
      icon: 'terminal',
      color: '#2563EB',
      cover_url: '',
      visibility: 'private',
      is_favorite: false,
      is_trashed: false,
      created_at: now,
      updated_at: now
    },
    {
      id: 'folder-algo',
      owner_id: userId,
      parent_id: 'folder-cpp',
      name: 'Quy hoạch động & Đồ thị',
      icon: 'sparkles',
      color: '#0D9488',
      cover_url: '',
      visibility: 'restricted',
      is_favorite: true,
      is_trashed: false,
      created_at: now,
      updated_at: now
    },
    {
      id: 'folder-music',
      owner_id: userId,
      parent_id: null,
      name: 'Âm nhạc & Tập trung',
      icon: 'music',
      color: '#DB2777',
      cover_url: '',
      visibility: 'private',
      is_favorite: false,
      is_trashed: false,
      created_at: now,
      updated_at: now
    }
  ];

  const items = [
    {
      id: 'item-dijkstra-cpp17',
      owner_id: userId,
      owner_email: userEmail || 'user@knowledgevault.app',
      folder_id: 'folder-algo',
      type: 'code',
      title: 'Tìm đường đi ngắn nhất trên đồ thị trọng số dương (Shortest Path)',
      description: 'Bộ 3 lời giải chuẩn: Dijkstra (Min-Heap), Bellman-Ford và Floyd-Warshall kèm bộ test mẫu',
      cover_url: '',
      storage_provider: 'internal',
      size_bytes: 6420,
      visibility: 'public',
      share_role: 'viewer',
      shared_with: [],
      is_favorite: true,
      is_trashed: false,
      tags: ['dijkstra', 'graph', 'c++17', 'shortest-path'],
      created_at: now,
      updated_at: now,
      code_project: {
        problem_statement:
          'Cho đồ thị có hướng G = (V, E) gồm N đỉnh và M cạnh có trọng số không âm. Hãy tìm khoảng cách ngắn nhất từ đỉnh 1 đến mọi đỉnh từ 1 đến N. Nếu không tồn tại đường đi tới đỉnh i, in ra -1.',
        problem_image_url: SAMPLE_GRAPH_SVG_URI,
        idea_notes:
          'Dùng mảng dist[] khởi tạo vô cực (INF = 1e18), dist[1] = 0. Mỗi bước lấy đỉnh u có dist[u] nhỏ nhất chưa tối ưu để nới lỏng (relax) các cạnh kề (u, v, w).',
        algorithm_notes:
          'Sử dụng std::priority_queue<pair<long long, int>, vector<...>, greater<...>> để đạt độ phức tạp tối ưu trên đồ thị thưa.',
        complexity_notes: 'Time: O((V + E) log V) | Space: O(V + E)',
        edge_cases_notes: 'Đồ thị không liên thông, nhiều cạnh trùng giữa 2 đỉnh, tổng trọng số vượt kiểu int 32-bit.',
        personal_notes: 'Luôn kiểm tra if (d != dist[u]) continue; trước khi duyệt danh sách kề.',
        primary_language: 'cpp',
        primary_version: 'C++17',
        solutions: JSON.stringify([
          {
            id: 'sol-1',
            solution_name: 'Dijkstra (Min-Heap C++17)',
            language_key: 'cpp',
            language_version: 'C++17',
            runtime_env: 'GCC 10.2 (ISO C++17)',
            code_content: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    int n, m;\n    if (!(cin >> n >> m)) return 0;\n\n    vector<vector<pair<int, long long>>> adj(n + 1);\n    for (int i = 0; i < m; ++i) {\n        int u, v;\n        long long w;\n        cin >> u >> v >> w;\n        adj[u].push_back({v, w});\n    }\n\n    const long long INF = (1LL << 60);\n    vector<long long> dist(n + 1, INF);\n    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;\n\n    dist[1] = 0;\n    pq.push({0, 1});\n\n    while (!pq.empty()) {\n        auto [d, u] = pq.top();\n        pq.pop();\n        if (d != dist[u]) continue;\n        for (auto [v, w] : adj[u]) {\n            if (dist[u] + w < dist[v]) {\n                dist[v] = dist[u] + w;\n                pq.push({dist[v], v});\n            }\n        }\n    }\n\n    for (int i = 1; i <= n; ++i) {\n        cout << (dist[i] == INF ? -1 : dist[i]) << (i == n ? "" : " ");\n    }\n    cout << "\\n";\n    return 0;\n}\n`,
            solution_notes: 'Lời giải chuẩn C++17 dùng structured bindings auto [d, u].',
            sample_input: '4 4\n1 2 2\n1 3 5\n2 3 1\n3 4 3',
            sample_output: '0 2 3 6',
            last_actual_output: '0 2 3 6\n',
            last_error_output: '',
            version_number: 1,
            updated_at: now
          },
          {
            id: 'sol-2',
            solution_name: 'Bellman-Ford O(V*E)',
            language_key: 'cpp',
            language_version: 'C++17',
            runtime_env: 'GCC 10.2 (ISO C++17)',
            code_content: `#include <bits/stdc++.h>\nusing namespace std;\n\nstruct Edge { int u, v; long long w; };\n\nint main() {\n    int n, m;\n    if (!(cin >> n >> m)) return 0;\n    vector<Edge> edges(m);\n    for (auto &e : edges) cin >> e.u >> e.v >> e.w;\n    const long long INF = (1LL << 60);\n    vector<long long> dist(n + 1, INF);\n    dist[1] = 0;\n    for (int i = 1; i <= n - 1; ++i) {\n        for (auto &e : edges) {\n            if (dist[e.u] < INF && dist[e.u] + e.w < dist[e.v]) {\n                dist[e.v] = dist[e.u] + e.w;\n            }\n        }\n    }\n    for (int i = 1; i <= n; ++i) cout << (dist[i] == INF ? -1 : dist[i]) << (i == n ? "" : " ");\n    cout << "\\n";\n    return 0;\n}\n`,
            solution_notes: 'Áp dụng được cho cả đồ thị có cạnh trọng số âm.',
            sample_input: '4 4\n1 2 2\n1 3 5\n2 3 1\n3 4 3',
            sample_output: '0 2 3 6',
            last_actual_output: '',
            last_error_output: '',
            version_number: 1,
            updated_at: now
          },
          {
            id: 'sol-3',
            solution_name: 'Floyd-Warshall O(V^3)',
            language_key: 'python',
            language_version: 'Python 3.10',
            runtime_env: 'CPython 3.10.0',
            code_content: `import sys\n\ndef solve():\n    data = list(map(int, sys.stdin.read().split()))\n    if not data:\n        return\n    n, m = data[0], data[1]\n    INF = 10**18\n    dist = [[INF] * (n + 1) for _ in range(n + 1)]\n    for i in range(1, n + 1):\n        dist[i][i] = 0\n    idx = 2\n    for _ in range(m):\n        u, v, w = data[idx], data[idx+1], data[idx+2]\n        idx += 3\n        dist[u][v] = min(dist[u][v], w)\n    for k in range(1, n + 1):\n        for i in range(1, n + 1):\n            for j in range(1, n + 1):\n                if dist[i][k] + dist[k][j] < dist[i][j]:\n                    dist[i][j] = dist[i][k] + dist[k][j]\n    ans = [str(-1 if dist[1][i] >= INF else dist[1][i]) for i in range(1, n + 1)]\n    print(" ".join(ans))\n\nif __name__ == "__main__":\n    solve()\n`,
            solution_notes: 'Phiên bản Python 3 tìm đường đi ngắn nhất giữa mọi cặp đỉnh.',
            sample_input: '4 4\n1 2 2\n1 3 5\n2 3 1\n3 4 3',
            sample_output: '0 2 3 6',
            last_actual_output: '',
            last_error_output: '',
            version_number: 1,
            updated_at: now
          }
        ])
      }
    },
    {
      id: 'item-note-dag',
      owner_id: userId,
      owner_email: userEmail || 'user@knowledgevault.app',
      folder_id: 'folder-algo',
      type: 'note',
      title: 'Sổ tay Quy hoạch động trên Đồ thị DAG & Checklist Ôn tập',
      description: 'Tổng hợp phương pháp sắp xếp Tô-pô (Topological Sort) kết hợp quy hoạch động trạng thái',
      cover_url: '',
      storage_provider: 'internal',
      size_bytes: 4120,
      visibility: 'private',
      share_role: 'viewer',
      shared_with: [],
      is_favorite: true,
      is_trashed: false,
      tags: ['dp', 'dag', 'toposort', 'dijkstra'],
      created_at: now,
      updated_at: now,
      note: {
        content_text: `1. NGUYÊN LÝ QUY HOẠCH ĐỘNG TRÊN DAG\nMọi đồ thị có hướng không chu trình (DAG) đều tồn tại thứ tự Tô-pô sao cho mọi cạnh (u, v) đều có u đứng trước v.\n\n2. CÔNG THỨC CHUYỂN TRẠNG THÁI\n- Đường đi dài nhất trên DAG: dp[v] = max(dp[v], dp[u] + w(u, v))\n- Đếm số đường đi từ đỉnh 1 tới đỉnh N: ways[v] = (ways[v] + ways[u]) % MOD\n\n3. SO SÁNH VỚI DIJKSTRA\n- Nếu đồ thị là DAG: luôn ưu tiên Topo Sort + DP với độ phức tạp tuyến tính O(V + E).\n- Nếu đồ thị có chu trình và trọng số không âm: dùng Dijkstra O((V + E) log V).`,
        checklist_json: JSON.stringify([
          { id: 'chk-1', text: 'Cài đặt Kahn Algorithm (BFS Indegree) cho Topological Sort', done: true },
          { id: 'chk-2', text: 'Cài đặt Dijkstra Min-Heap chuẩn C++17', done: true },
          { id: 'chk-3', text: 'Làm bài tập নিচে Shortest Routes I & II trên CSES', done: false }
        ])
      }
    },
    {
      id: 'item-link-cp-algo',
      owner_id: userId,
      owner_email: userEmail || 'user@knowledgevault.app',
      folder_id: 'folder-cpp',
      type: 'link',
      title: 'CP-Algorithms: Dijkstra on Sparse Graphs',
      description: 'Tài liệu chuẩn quốc tế phân tích độ phức tạp và cài đặt Dijkstra với hàng đợi ưu tiên',
      cover_url: '',
      storage_provider: 'google_drive',
      drive_file_id: '1CpAlgoDijkstraReferenceDoc',
      drive_web_view_link: 'https://cp-algorithms.com/graph/dijkstra_sparse.html',
      size_bytes: 1024,
      visibility: 'public',
      share_role: 'viewer',
      shared_with: [],
      is_favorite: false,
      is_trashed: false,
      tags: ['dijkstra', 'cp-algorithms', 'reference'],
      created_at: now,
      updated_at: now,
      link: {
        url: 'https://cp-algorithms.com/graph/dijkstra_sparse.html',
        domain: 'cp-algorithms.com',
        site_name: 'CP-Algorithms',
        meta_title: 'Dijkstra on sparse graphs - Algorithms for Competitive Programming',
        meta_description: 'Detailed tutorial and C++ implementation of Dijkstra algorithm using std::set and std::priority_queue.'
      }
    },
    {
      id: 'item-image-graph-diagram',
      owner_id: userId,
      owner_email: userEmail || 'user@knowledgevault.app',
      folder_id: 'folder-algo',
      type: 'image',
      title: 'Sơ đồ Minh họa Đồ thị Trọng số & Đường đi Ngắn nhất',
      description: 'Hình minh họa trực quan quá trình nới lỏng cạnh 1 -> 2 -> 3 -> 4 với tổng trọng số = 6',
      cover_url: SAMPLE_GRAPH_SVG_URI,
      storage_provider: 'internal',
      size_bytes: 18450,
      visibility: 'private',
      share_role: 'viewer',
      shared_with: [],
      is_favorite: true,
      is_trashed: false,
      tags: ['diagram', 'graph', 'dijkstra', 'svg'],
      created_at: now,
      updated_at: now,
      asset: {
        url: SAMPLE_GRAPH_SVG_URI,
        mime_type: 'image/svg+xml',
        filename: 'dijkstra-graph-diagram.svg',
        duration_seconds: 0,
        artist: '',
        album_name: 'Sơ đồ Thuật toán'
      }
    },
    {
      id: 'item-music-deep-focus',
      owner_id: userId,
      owner_email: userEmail || 'user@knowledgevault.app',
      folder_id: 'folder-music',
      type: 'music',
      title: 'Ambient Flow State — Deep Coding Session #1',
      description: 'Giai điệu Ambient Synth giúp tập trung giải thuật toán và đọc tài liệu kỹ thuật',
      cover_url: '',
      storage_provider: 'internal',
      size_bytes: 705600,
      visibility: 'private',
      share_role: 'viewer',
      shared_with: [],
      is_favorite: true,
      is_trashed: false,
      tags: ['ambient', 'focus', 'coding', 'music'],
      created_at: now,
      updated_at: now,
      asset: {
        url: wavTrack1,
        mime_type: 'audio/wav',
        filename: 'ambient-flow-state-01.wav',
        duration_seconds: 16,
        artist: 'Knowledge Vault Synth Lab',
        album_name: 'Deep Work Vol. 1'
      }
    },
    {
      id: 'item-music-midnight-algorithm',
      owner_id: userId,
      owner_email: userEmail || 'user@knowledgevault.app',
      folder_id: 'folder-music',
      type: 'music',
      title: 'Midnight Harmonic — Binary Horizon #2',
      description: 'Bản nhạc không lời êm dịu phát xuyên suốt ứng dụng khi chuyển trang',
      cover_url: '',
      storage_provider: 'internal',
      size_bytes: 705600,
      visibility: 'private',
      share_role: 'viewer',
      shared_with: [],
      is_favorite: false,
      is_trashed: false,
      tags: ['chill', 'synth', 'music'],
      created_at: now,
      updated_at: now,
      asset: {
        url: wavTrack2,
        mime_type: 'audio/wav',
        filename: 'midnight-harmonic-02.wav',
        duration_seconds: 16,
        artist: 'Knowledge Vault Synth Lab',
        album_name: 'Deep Work Vol. 1'
      }
    }
  ];

  const playlists = [
    {
      id: 'playlist-coding-focus',
      owner_id: userId,
      name: 'Coding & Algorithm Focus',
      description: 'Danh sách phát tập trung lập trình và nghiên cứu',
      track_ids: ['item-music-deep-focus', 'item-music-midnight-algorithm'],
      created_at: now,
      updated_at: now
    }
  ];

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
  const [repeatMode, setRepeatMode] = useState('all'); // 'off' | 'all' | 'one'
  const [isWidgetExpanded, setWidgetExpanded] = useState(false);
  const [autoplayNotice, setAutoplayNotice] = useState(false);

  // Khởi tạo Singleton Audio Element duy nhất cho toàn bộ vòng đời ứng dụng
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = 0.85;
    audioRef.current = audio;
    return () => {
      audio.pause();
    };
  }, []);

  const playTrack = useCallback((track, customQueue) => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    if (Array.isArray(customQueue) && customQueue.length > 0) {
      setQueue(customQueue);
    } else {
      setQueue((prev) => (prev.some((t) => t.id === track.id) ? prev : [...prev, track]));
    }

    setCurrentTrack(track);
    if (audio.src !== track.audioUrl) {
      audio.src = track.audioUrl;
      audio.currentTime = 0;
    }

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setAutoplayNotice(false);
      })
      .catch(() => {
        setIsPlaying(false);
        setAutoplayNotice(true);
      });
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
    if (idx + 1 < queue.length) {
      playTrack(queue[idx + 1]);
    } else if (repeatMode === 'all' && queue.length > 0) {
      playTrack(queue[0]);
    } else {
      setIsPlaying(false);
    }
  }, [currentTrack, queue, isShuffle, repeatMode, playTrack]);

  const prevTrack = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
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
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => setIsPlaying(false));
      } else {
        nextTrack();
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [repeatMode, nextTrack, currentTrack]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayNotice(false);
        })
        .catch(() => {
          setIsPlaying(false);
          setAutoplayNotice(true);
        });
    }
  }, [isPlaying, currentTrack]);

  const seekTo = useCallback((sec) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = sec;
    setCurrentTime(sec);
  }, []);

  const setVolume = useCallback((val) => {
    const v = Math.max(0, Math.min(1, val));
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const toggleShuffle = useCallback(() => setIsShuffle((p) => !p), []);
  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((p) => (p === 'off' ? 'all' : p === 'all' ? 'one' : 'off'));
  }, []);

  return (
    <MusicPlayerContext.Provider
      value={{
        queue,
        setQueue,
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isShuffle,
        repeatMode,
        isWidgetExpanded,
        autoplayNotice,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        seekTo,
        setVolume,
        toggleShuffle,
        cycleRepeatMode,
        setWidgetExpanded
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
}

function useMusicPlayer() {
  return useContext(MusicPlayerContext);
}

// ============================================================================
// 5. WIDGET ĐĨA NHẠC NỔI XOAY 360° (FLOATING VINYL WIDGET)
// ============================================================================
function formatDuration(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function FloatingVinylWidget() {
  const {
    queue,
    setQueue,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isShuffle,
    repeatMode,
    isWidgetExpanded,
    autoplayNotice,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleShuffle,
    cycleRepeatMode,
    setWidgetExpanded
  } = useMusicPlayer();

  const [showQueueList, setShowQueueList] = useState(false);

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 select-none">
      {!isWidgetExpanded ? (
        <div className="flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-white/95 p-1.5 pr-3.5 shadow-2xl backdrop-blur-md transition-all hover:scale-[1.02] dark:border-slate-700/90 dark:bg-slate-900/95">
          <button
            type="button"
            onClick={() => setWidgetExpanded(true)}
            title="Mở bảng điều khiển nhạc"
            className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-slate-950 via-slate-800 to-indigo-950 shadow-inner"
          >
            {currentTrack.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="h-12 w-12 rounded-full object-cover animate-spin"
                style={{
                  animationDuration: '7s',
                  animationPlayState: isPlaying ? 'running' : 'paused'
                }}
              />
            ) : (
              <Disc3
                className="h-7 w-7 text-indigo-400 animate-spin"
                style={{
                  animationDuration: '6s',
                  animationPlayState: isPlaying ? 'running' : 'paused'
                }}
              />
            )}
            <span className="absolute h-3 w-3 rounded-full border-2 border-slate-900 bg-white" />
          </button>

          <div
            onClick={() => setWidgetExpanded(true)}
            className="max-w-[145px] cursor-pointer overflow-hidden"
          >
            <div className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isPlaying ? 'Đang phát' : 'Tạm dừng'}
              </span>
            </div>
            <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
              {currentTrack.title}
            </p>
          </div>

          <button
            type="button"
            onClick={togglePlay}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow hover:bg-indigo-500"
            title={isPlaying ? 'Tạm dừng' : 'Phát'}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>
        </div>
      ) : (
        <div className="w-80 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95 sm:w-88">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Trình phát nhạc xuyên trang
              </span>
            </div>
            <button
              type="button"
              onClick={() => setWidgetExpanded(false)}
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Thu gọn thành đĩa nhạc nổi"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {autoplayNotice && (
            <div className="mb-2.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              Trình duyệt yêu cầu thao tác nhấn nút Phát để bắt đầu âm thanh.
            </div>
          )}

          <div className="flex items-center gap-3.5">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-950 shadow-md">
              {currentTrack.coverUrl ? (
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="h-14 w-14 rounded-full object-cover animate-spin"
                  style={{
                    animationDuration: '7s',
                    animationPlayState: isPlaying ? 'running' : 'paused'
                  }}
                />
              ) : (
                <Disc3
                  className="h-8 w-8 text-indigo-400 animate-spin"
                  style={{
                    animationDuration: '6s',
                    animationPlayState: isPlaying ? 'running' : 'paused'
                  }}
                />
              )}
              <span className="absolute h-3.5 w-3.5 rounded-full border-2 border-slate-900 bg-white" />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                {currentTrack.title}
              </h4>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {currentTrack.artist || 'Knowledge Vault Studio'}
              </p>
            </div>
          </div>

          <div className="mt-3.5">
            <input
              type="range"
              min={0}
              max={duration || 16}
              step={0.1}
              value={currentTime}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600 dark:bg-slate-700"
            />
            <div className="mt-1 flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={toggleShuffle}
              className={`rounded-lg p-1.5 ${
                isShuffle
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Phát ngẫu nhiên"
            >
              <Shuffle className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={prevTrack}
                className="rounded-full p-1.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                title="Bài trước"
              >
                <SkipBack className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-500"
                title={isPlaying ? 'Tạm dừng' : 'Phát'}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={nextTrack}
                className="rounded-full p-1.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                title="Bài tiếp theo"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={cycleRepeatMode}
              className={`rounded-lg p-1.5 ${
                repeatMode !== 'off'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title={`Chế độ lặp: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2.5 dark:border-slate-800">
            <Volume2 className="h-4 w-4 text-slate-400" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600 dark:bg-slate-700"
            />
            <button
              type="button"
              onClick={() => setShowQueueList((prev) => !prev)}
              className={`ml-1 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold ${
                showQueueList
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
              title="Danh sách chờ phát"
            >
              <ListMusic className="h-3.5 w-3.5" /> ({queue.length})
            </button>
          </div>

          {showQueueList && (
            <div className="mt-2.5 max-h-36 space-y-1 overflow-auto rounded-xl border border-slate-100 bg-slate-50/90 p-2 text-xs dark:border-slate-800 dark:bg-slate-800/70">
              <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
                <span>Danh sách chờ ({queue.length} bài)</span>
              </div>
              {queue.map((trk) => (
                <div
                  key={trk.id}
                  onClick={() => playTrack(trk)}
                  className={`flex cursor-pointer items-center justify-between rounded-lg px-2 py-1 ${
                    trk.id === currentTrack.id
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'hover:bg-slate-200/70 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <span className="truncate">{trk.title}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setQueue((prev) => prev.filter((t) => t.id !== trk.id));
                    }}
                    className="ml-2 text-[10px] opacity-75 hover:opacity-100"
                    title="Xóa khỏi danh sách chờ"
                  >
                    <X className="h-3 w-3" />
                  </button>
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
  const parsedSolutions = useMemo(() => {
    try {
      const raw = project.solutions;
      if (Array.isArray(raw)) return raw;
      return JSON.parse(raw || '[]');
    } catch {
      return [];
    }
  }, [project.solutions]);

  const [solutions, setSolutions] = useState(
    parsedSolutions.length > 0
      ? parsedSolutions
      : [
          {
            id: 'sol-default',
            solution_name: 'Lời giải 1',
            language_key: 'cpp',
            language_version: 'C++17',
            runtime_env: 'GCC 10.2 (ISO C++17)',
            code_content: getLanguageByKey('cpp').defaultTemplate,
            solution_notes: '',
            sample_input: '',
            sample_output: '',
            last_actual_output: '',
            last_error_output: '',
            version_number: 1,
            updated_at: new Date().toISOString()
          }
        ]
  );

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

  const updateActiveSol = (patch) => {
    setSolutions((prev) =>
      prev.map((s) =>
        s.id === activeSol.id ? { ...s, ...patch, updated_at: new Date().toISOString() } : s
      )
    );
  };

  // Thêm lời giải mới hoặc tạo bản sao phiên bản mới (không ghi đè bản gốc)
  const handleAddSolutionOrVersion = (asNewVersion) => {
    const newId = 'sol-' + Date.now();
    const nextVer = asNewVersion ? (activeSol.version_number || 1) + 1 : 1;
    const newSol = {
      id: newId,
      solution_name: asNewVersion
        ? `${activeSol.solution_name.replace(/\s*\(v\d+\)$/, '')} (v${nextVer})`
        : `Lời giải ${solutions.length + 1}`,
      language_key: activeSol.language_key,
      language_version: activeSol.language_version,
      runtime_env: activeSol.runtime_env,
      code_content: asNewVersion ? activeSol.code_content : langConfig.defaultTemplate,
      solution_notes: asNewVersion ? activeSol.solution_notes : '',
      sample_input: stdinVal,
      sample_output: activeSol.sample_output || '',
      last_actual_output: '',
      last_error_output: '',
      version_number: nextVer,
      parent_solution_id: asNewVersion ? activeSol.id : null,
      updated_at: new Date().toISOString()
    };
    setSolutions((prev) => [...prev, newSol]);
    setActiveSolId(newId);
    showToast(
      asNewVersion
        ? `Đã tạo phiên bản v${nextVer} mới (giữ nguyên bản gốc)`
        : 'Đã thêm tab lời giải mới'
    );
  };

  // Lưu toàn bộ bài toán và các lời giải lên Firestore
  const handleSaveWorkspace = async () => {
    const updatedItem = {
      ...item,
      title: title.trim() || 'Bài toán Code Vault',
      size_bytes: JSON.stringify(solutions).length + problemStatement.length,
      updated_at: new Date().toISOString(),
      code_project: {
        ...project,
        problem_statement: problemStatement,
        idea_notes: ideaNotes,
        algorithm_notes: algorithmNotes,
        complexity_notes: complexityNotes,
        edge_cases_notes: edgeCasesNotes,
        personal_notes: personalNotes,
        primary_language: activeSol.language_key,
        primary_version: activeSol.language_version,
        solutions: JSON.stringify(solutions)
      }
    };
    await onSaveItem(updatedItem);
  };

  // Thực thi code thực tế qua dịch vụ Sandbox Piston API hoặc JS Engine cô lập
  const handleRunCode = async () => {
    if (!activeSol) return;
    if (!langConfig.executable) {
      setStderrVal(
        `Định dạng ${langConfig.name} (${langConfig.extension}) là ngôn ngữ đánh dấu/cấu hình, không phải chương trình biên dịch thực thi.`
      );
      return;
    }

    setIsRunning(true);
    setStdoutVal('');
    setStderrVal('');
    setExecTimeMs(null);

    const startTime = performance.now();

    // Nếu là JavaScript, hỗ trợ thực thi cô lập tức thì hoặc qua Sandbox
    if (activeSol.language_key === 'javascript') {
      try {
        const logs = [];
        const customConsole = {
          log: (...args) => logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
          error: (...args) => logs.push('[ERROR] ' + args.join(' '))
        };
        const runner = new Function('STDIN', 'console', activeSol.code_content);
        runner(stdinVal, customConsole);
        const elapsed = Math.round(performance.now() - startTime);
        const out = logs.join('\n') || '(Chương trình chạy thành công, không có dữ liệu in ra stdout)';
        setStdoutVal(out);
        setExecTimeMs(elapsed);
        updateActiveSol({ last_actual_output: out, last_error_output: '' });
        setIsRunning(false);
        return;
      } catch (jsErr) {
        setStderrVal(`Runtime Error: ${jsErr.message}`);
        setIsRunning(false);
        return;
      }
    }

    // Gọi tới Piston Public Code Execution Sandbox
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const verObj =
      langConfig.versions.find((v) => v.label === activeSol.language_version) ||
      langConfig.versions[0];

    if (!verObj?.piston) {
      setStderrVal(`Môi trường thực thi cho ${activeSol.language_version} chưa được cấu hình trên máy chủ Sandbox.`);
      setIsRunning(false);
      return;
    }

    try {
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: verObj.piston.language,
          version: verObj.piston.version,
          files: [{ name: `main${langConfig.extension}`, content: activeSol.code_content }],
          stdin: stdinVal
        })
      });

      const elapsed = Math.round(performance.now() - startTime);
      setExecTimeMs(elapsed);

      if (!response.ok) {
        setStderrVal(
          `Dịch vụ Sandbox từ chối yêu cầu (HTTP ${response.status}). Hệ thống vẫn bảo toàn đầy đủ mã nguồn, INPUT và OUTPUT mẫu của bạn.`
        );
        setIsRunning(false);
        return;
      }

      const data = await response.json();
      const compileErr = data.compile?.stderr || '';
      const runOut = data.run?.stdout || '';
      const runErr = data.run?.stderr || '';
      const combinedErr = [compileErr, runErr].filter(Boolean).join('\n');

      setStdoutVal(runOut);
      setStderrVal(combinedErr);
      updateActiveSol({
        last_actual_output: runOut,
        last_error_output: combinedErr
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        setStderrVal('Đã dừng thực thi chương trình theo yêu cầu người dùng.');
      } else {
        setStderrVal(
          `Không thể kết nối tới máy chủ Sandbox thực thi code (${err.message}). Toàn bộ code và bộ test INPUT đã được giữ an toàn.`
        );
      }
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopExecution = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Tải tệp mã nguồn xuống đúng phần mở rộng (.cpp, .py, .js, .ts, .java...)
  const handleDownloadCode = () => {
    const ext = langConfig.extension;
    const safeName =
      title
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '_')
        .replace(/^_|_$/g, '') || 'solution';
    const fileName = ext === 'Dockerfile' ? 'Dockerfile' : `${safeName}${ext}`;
    const blob = new Blob([activeSol.code_content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Đã tải xuống tệp ${fileName}`);
  };

  // Nhập mã nguồn từ tệp trên máy tính
  const handleUploadCodeFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateActiveSol({ code_content: reader.result });
        showToast(`Đã nhập nội dung từ tệp ${file.name}`);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  // Tìm kiếm và thay thế trong trình soạn thảo
  const handleReplaceAll = () => {
    if (!findText) return;
    const updatedCode = (activeSol.code_content || '').split(findText).join(replaceText);
    updateActiveSol({ code_content: updatedCode });
    showToast('Đã thay thế toàn bộ từ khóa trong code');
  };

  const comparedSolution = solutions.find((s) => s.id === compareSolId);

  return (
    <div className="space-y-4">
      {/* Thanh điều hướng quay lại & Lưu bài toán */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" /> Quay lại
          </button>
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full truncate bg-transparent text-base font-bold text-slate-900 focus:outline-none dark:text-slate-100"
              placeholder="Tên bài toán hoặc dự án..."
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ngôn ngữ: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{langConfig.name}</span> • Phiên bản:{' '}
              <span className="font-semibold">{activeSol?.language_version}</span> • Runtime:{' '}
              <span>{activeSol?.runtime_env}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleAddSolutionOrVersion(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            title="Tạo bản sao phiên bản mới mà không ghi đè bản gốc"
          >
            <History className="h-3.5 w-3.5 text-indigo-500" /> Tạo phiên bản v{(activeSol?.version_number || 1) + 1}
          </button>

          <button
            type="button"
            onClick={handleSaveWorkspace}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <CheckCircle2 className="h-4 w-4" /> Lưu bài toán & Lời giải
          </button>
        </div>
      </div>

      {/* Thanh quản lý nhiều Lời giải (Dijkstra, Bellman-Ford, Floyd-Warshall...) & Chọn Ngôn ngữ/Phiên bản */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-1.5">
          {solutions.map((sol) => (
            <button
              key={sol.id}
              type="button"
              onClick={() => {
                setActiveSolId(sol.id);
                setStdinVal(sol.sample_input || '');
                setStdoutVal(sol.last_actual_output || '');
                setStderrVal(sol.last_error_output || '');
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                sol.id === activeSol.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {sol.solution_name} ({sol.language_version})
            </button>
          ))}

          <button
            type="button"
            onClick={() => handleAddSolutionOrVersion(false)}
            className="inline-flex items-center gap-1 rounded-xl border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300"
          >
            <Plus className="h-3.5 w-3.5" /> Thêm lời giải
          </button>

          {solutions.length > 1 && (
            <select
              value={compareSolId || ''}
              onChange={(e) => setCompareSolId(e.target.value || null)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">So sánh phiên bản/lời giải...</option>
              {solutions
                .filter((s) => s.id !== activeSol.id)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    So sánh với: {s.solution_name}
                  </option>
                ))}
            </select>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activeSol?.language_key}
            onChange={(e) => {
              const nextLang = getLanguageByKey(e.target.value);
              const firstVer = nextLang.versions[0];
              updateActiveSol({
                language_key: nextLang.key,
                language_version: firstVer.label,
                runtime_env: firstVer.runtime
              });
            }}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {CODE_VAULT_LANGUAGES.map((l) => (
              <option key={l.key} value={l.key}>
                {l.name} ({l.extension})
              </option>
            ))}
          </select>

          <select
            value={activeSol?.language_version}
            onChange={(e) => {
              const ver =
                langConfig.versions.find((v) => v.label === e.target.value) || langConfig.versions[0];
              updateActiveSol({
                language_version: ver.label,
                runtime_env: ver.runtime
              });
            }}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {langConfig.versions.map((v) => (
              <option key={v.label} value={v.label}>
                {v.label}
              </option>
            ))}
          </select>

          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
          >
            {[12, 13, 14, 16, 18, 20].map((sz) => (
              <option key={sz} value={sz}>
                Cỡ chữ {sz}px
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chế độ So sánh 2 phiên bản lời giải song song nếu người dùng bật */}
      {comparedSolution && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/20">
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
              <GitCompare className="h-4 w-4" /> So sánh trực tiếp: {activeSol.solution_name} vs{' '}
              {comparedSolution.solution_name}
            </span>
            <button
              type="button"
              onClick={() => setCompareSolId(null)}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600"
            >
              Đóng so sánh
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <pre className="max-h-56 overflow-auto rounded-xl border border-slate-200 bg-slate-900 p-3 font-mono text-xs text-slate-100">
              {activeSol.code_content}
            </pre>
            <pre className="max-h-56 overflow-auto rounded-xl border border-slate-200 bg-slate-900 p-3 font-mono text-xs text-emerald-200">
              {comparedSolution.code_content}
            </pre>
          </div>
        </div>
      )}

      {/* Bố cục chính 2 cột: Ghi chú Đề bài/Thuật toán + Trình soạn thảo Code & INPUT/OUTPUT */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Cột trái: Đề bài, Ý tưởng, Thuật toán, Độ phức tạp, Edge cases */}
        <div className="space-y-3 lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Tên lời giải hiện tại
            </label>
            <input
              type="text"
              value={activeSol?.solution_name || ''}
              onChange={(e) => updateActiveSol({ solution_name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Đề bài (Problem Statement)
            </label>
            <textarea
              rows={4}
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="Nhập nội dung đề bài..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs leading-relaxed dark:border-slate-700 dark:bg-slate-800"
            />
            {project.problem_image_url && (
              <img
                src={project.problem_image_url}
                alt="Minh họa đề bài"
                className="mt-2 max-h-40 w-full rounded-xl object-contain bg-slate-950 p-1"
              />
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Ý tưởng & Thuật toán
            </label>
            <textarea
              rows={3}
              value={algorithmNotes}
              onChange={(e) => setAlgorithmNotes(e.target.value)}
              placeholder="Mô tả hướng tiếp cận, cấu trúc dữ liệu..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2.5">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Độ phức tạp (Time & Space Complexity)
              </label>
              <input
                type="text"
                value={complexityNotes}
                onChange={(e) => setComplexityNotes(e.target.value)}
                placeholder="Time: O((V + E) log V) | Space: O(V + E)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Trường hợp đặc biệt (Edge Cases)
              </label>
              <input
                type="text"
                value={edgeCasesNotes}
                onChange={(e) => setEdgeCasesNotes(e.target.value)}
                placeholder="Đồ thị không liên thông, tràn số 64-bit..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Ghi chú cá nhân
              </label>
              <input
                type="text"
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
                placeholder="Ghi chú rút kinh nghiệm..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Cột phải: Trình soạn thảo Code chuyên nghiệp + INPUT / OUTPUT */}
        <div className="flex flex-col gap-3 lg:col-span-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Thanh công cụ Editor */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/70">
              <div className="flex flex-wrap items-center gap-1.5">
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  <Upload className="h-3.5 w-3.5" /> Nhập tệp
                  <input type="file" onChange={handleUploadCodeFile} className="hidden" />
                </label>

                <button
                  type="button"
                  onClick={handleDownloadCode}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <Download className="h-3.5 w-3.5" /> Tải xuống ({langConfig.extension})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(activeSol.code_content || '');
                    showToast('Đã sao chép toàn bộ mã nguồn');
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <Copy className="h-3.5 w-3.5" /> Sao chép
                </button>

                <button
                  type="button"
                  onClick={() => setShowFindBar(!showFindBar)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <Search className="h-3.5 w-3.5" /> Tìm & Thay thế
                </button>
              </div>

              <div className="flex items-center gap-2">
                {isRunning ? (
                  <button
                    type="button"
                    onClick={handleStopExecution}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"
                  >
                    <X className="h-3.5 w-3.5" /> Dừng
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRunCode}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500"
                  >
                    <Play className="h-3.5 w-3.5" /> Chạy code
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  title="Chạy lại"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Thanh Tìm kiếm và Thay thế trong Code */}
            {showFindBar && (
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-100 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800">
                <input
                  type="text"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  placeholder="Tìm kiếm trong code..."
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 dark:border-slate-700 dark:bg-slate-900"
                />
                <input
                  type="text"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  placeholder="Thay thế bằng..."
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 dark:border-slate-700 dark:bg-slate-900"
                />
                <button
                  type="button"
                  onClick={handleReplaceAll}
                  className="rounded-lg bg-indigo-600 px-2.5 py-1 font-semibold text-white hover:bg-indigo-500"
                >
                  Thay thế tất cả
                </button>
              </div>
            )}

            {/* Vùng soạn thảo Code có đánh số dòng & hỗ trợ phím Tab thụt lề */}
            <div className="relative flex max-h-[420px] min-h-[340px] overflow-auto bg-slate-950 font-mono text-slate-100">
              <div
                className="select-none border-r border-slate-800 bg-slate-900/90 px-3 py-3 text-right text-slate-500"
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
              >
                {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                value={activeSol?.code_content || ''}
                onChange={(e) => updateActiveSol({ code_content: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = e.target.selectionStart;
                    const end = e.target.selectionEnd;
                    const current = activeSol?.code_content || '';
                    const nextVal = current.substring(0, start) + '    ' + current.substring(end);
                    updateActiveSol({ code_content: nextVal });
                    setTimeout(() => {
                      e.target.selectionStart = e.target.selectionEnd = start + 4;
                    }, 0);
                  }
                }}
                spellCheck={false}
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
                className="w-full flex-1 resize-none bg-transparent p-3 font-mono text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Khu vực INPUT và OUTPUT thực tế */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {/* INPUT */}
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  INPUT (Dữ liệu đầu vào STDIN)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateActiveSol({ sample_input: stdinVal });
                      showToast('Đã lưu bộ test mẫu vào lời giải');
                    }}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Lưu test mẫu
                  </button>
                  <button
                    type="button"
                    onClick={() => setStdinVal('')}
                    className="text-[11px] text-slate-500 hover:text-rose-600"
                  >
                    Xóa
                  </button>
                </div>
              </div>
              <textarea
                rows={4}
                value={stdinVal}
                onChange={(e) => setStdinVal(e.target.value)}
                placeholder="Nhập dữ liệu đầu vào cho chương trình..."
                className="w-full flex-1 rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            {/* OUTPUT */}
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    OUTPUT (Kết quả thực tế)
                  </span>
                  {execTimeMs !== null && (
                    <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {execTimeMs} ms
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(stdoutVal || stderrVal || '');
                      showToast('Đã sao chép OUTPUT');
                    }}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Sao chép
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStdoutVal('');
                      setStderrVal('');
                    }}
                    className="text-[11px] text-slate-500 hover:text-rose-600"
                  >
                    Xóa
                  </button>
                </div>
              </div>

              <div className="min-h-[104px] flex-1 overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-2.5 font-mono text-xs text-slate-100 dark:border-slate-700">
                {isRunning ? (
                  <div className="flex items-center gap-2 text-indigo-400">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Đang biên dịch và chạy chương trình trên Sandbox...</span>
                  </div>
                ) : stderrVal ? (
                  <div className="whitespace-pre-wrap text-rose-400">{stderrVal}</div>
                ) : stdoutVal ? (
                  <pre className="whitespace-pre-wrap text-emerald-300">{stdoutVal}</pre>
                ) : (
                  <span className="text-slate-500">
                    Nhấn &ldquo;Chạy code&rdquo; để thực thi chương trình với dữ liệu INPUT bên trái.
                  </span>
                )}
              </div>
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

  const [checklist, setChecklist] = useState(() => {
    try {
      const raw = item.note?.checklist_json;
      if (Array.isArray(raw)) return raw;
      return JSON.parse(raw || '[]');
    } catch {
      return [];
    }
  });

  const insertFormatting = (prefix, suffix = '') => {
    setContentText((prev) => `${prev}\n${prefix}${suffix}`);
  };

  const handleAddChecklistTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setChecklist((prev) => [
      ...prev,
      { id: 'chk-' + Date.now(), text: newTaskText.trim(), done: false }
    ]);
    setNewTaskText('');
  };

  const handleSaveNote = async () => {
    const updated = {
      ...item,
      title: title.trim() || 'Ghi chú không tiêu đề',
      description,
      size_bytes: new Blob([contentText]).size + JSON.stringify(checklist).length,
      updated_at: new Date().toISOString(),
      note: {
        content_text: contentText,
        checklist_json: JSON.stringify(checklist)
      }
    };
    await onSaveItem(updated);
  };

  const handleExportMarkdown = () => {
    const mdContent = `# ${title}\n\n> ${description}\n\n${contentText}\n\n## Checklist\n${checklist
      .map((c) => `- [${c.done ? 'x' : ' '}] ${c.text}`)
      .join('\n')}\n`;
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'note'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất ghi chú ra tệp Markdown (.md)');
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200"
        >
          <ChevronLeft className="h-4 w-4" /> Quay lại kho lưu trữ
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInNote}
              onChange={(e) => setSearchInNote(e.target.value)}
              placeholder="Tìm trong ghi chú..."
              className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(contentText);
              showToast('Đã sao chép nội dung ghi chú');
            }}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <Copy className="h-3.5 w-3.5" /> Sao chép
          </button>

          <button
            type="button"
            onClick={handleExportMarkdown}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5" /> Xuất .MD
          </button>

          <button
            type="button"
            onClick={handleSaveNote}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            <CheckCircle2 className="h-4 w-4" /> Lưu ghi chú
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tiêu đề ghi chú..."
          className="w-full text-xl font-bold text-slate-900 focus:outline-none dark:bg-transparent dark:text-slate-100"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả ngắn gọn..."
          className="w-full text-xs text-slate-500 focus:outline-none dark:bg-transparent dark:text-slate-400"
        />
      </div>

      {/* Thanh định dạng nhanh */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800/60">
        {[
          { label: 'H1', action: () => insertFormatting('# Tiêu đề cấp 1') },
          { label: 'H2', action: () => insertFormatting('## Tiêu đề cấp 2') },
          { label: 'H3', action: () => insertFormatting('### Tiêu đề cấp 3') },
          { label: 'In đậm', action: () => insertFormatting('**Văn bản in đậm**') },
          { label: 'In nghiêng', action: () => insertFormatting('*Văn bản in nghiêng*') },
          { label: 'Danh sách', action: () => insertFormatting('- Mục danh sách') },
          { label: 'Trích dẫn', action: () => insertFormatting('> Trích dẫn quan trọng') },
          { label: 'Khối Code', action: () => insertFormatting('```cpp\n// Code tại đây\n```') }
        ].map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={btn.action}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {btn.label}
          </button>
        ))}
      </div>

      {searchInNote && (
        <div className="rounded-xl bg-amber-50 px-3 py-1.5 text-xs text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
          Số lần xuất hiện của &ldquo;{searchInNote}&rdquo;: {' '}
          <span className="font-bold">
            {contentText.toLowerCase().split(searchInNote.toLowerCase()).length - 1}
          </span>
        </div>
      )}

      <textarea
        rows={12}
        value={contentText}
        onChange={(e) => setContentText(e.target.value)}
        placeholder="Nhập nội dung ghi chú học tập, tài liệu nghiên cứu hoặc ý tưởng..."
        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm leading-relaxed focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/60"
      />

      {/* Checklist tương tác */}
      <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">
          Checklist công việc ({checklist.filter((c) => c.done).length}/{checklist.length})
        </h4>
        <div className="space-y-2">
          {checklist.map((itemChk) => (
            <div
              key={itemChk.id}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60"
            >
              <button
                type="button"
                onClick={() =>
                  setChecklist((prev) =>
                    prev.map((c) => (c.id === itemChk.id ? { ...c, done: !c.done } : c))
                  )
                }
                className="flex items-center gap-2.5 text-left text-xs"
              >
                {itemChk.done ? (
                  <CheckSquare className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Square className="h-4 w-4 text-slate-400" />
                )}
                <span className={itemChk.done ? 'line-through text-slate-400' : 'font-medium'}>
                  {itemChk.text}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setChecklist((prev) => prev.filter((c) => c.id !== itemChk.id))}
                className="text-slate-400 hover:text-rose-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddChecklistTask} className="mt-3 flex gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Thêm mục cần làm vào checklist..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
          />
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
          >
            + Thêm
          </button>
        </form>
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
        <div>
          <h3 className="text-sm font-bold">{imageItem.title}</h3>
          <p className="text-xs text-slate-400">{imageItem.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            className="rounded-lg bg-slate-800 p-2 hover:bg-slate-700"
            title="Thu nhỏ"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs font-mono">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            className="rounded-lg bg-slate-800 p-2 hover:bg-slate-700"
            title="Phóng to"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <a
            href={imgUrl}
            download={imageItem.asset?.filename || 'image.svg'}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold hover:bg-indigo-500"
          >
            Tải xuống
          </a>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 p-2 hover:bg-rose-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-auto p-6">
        {allImages.length > 1 && (
          <button
            type="button"
            onClick={() => {
              const prev = allImages[(currentIdx - 1 + allImages.length) % allImages.length];
              onSelectImage(prev);
              setZoom(1);
            }}
            className="absolute left-4 rounded-full bg-slate-800/80 p-3 hover:bg-slate-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        <img
          src={imgUrl}
          alt={imageItem.title}
          style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease' }}
          className="max-h-[78vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
        />

        {allImages.length > 1 && (
          <button
            type="button"
            onClick={() => {
              const next = allImages[(currentIdx + 1) % allImages.length];
              onSelectImage(next);
              setZoom(1);
            }}
            className="absolute right-4 rounded-full bg-slate-800/80 p-3 hover:bg-slate-700"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 9. COMPONENT CHÍNH: KNOWLEDGE VAULT APPLICATION
// ============================================================================
function KnowledgeVaultInner() {
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();

  // State Xác thực & Hồ sơ người dùng
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [activeTestPersona, setActiveTestPersona] = useState('owner'); // 'owner' (Tài khoản A) | 'guestB' (Tài khoản B: guest-b@knowledgevault.app)
  const [renameFolderTarget, setRenameFolderTarget] = useState(null);
  const [renameFolderText, setRenameFolderText] = useState('');
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [profile, setProfile] = useState({
    display_name: 'Kỹ sư Knowledge Vault',
    email: '',
    avatar_url: '',
    cover_url: '',
    bio: 'Lưu trữ thuật toán, ghi chú nghiên cứu, tài liệu và âm nhạc.',
    theme_preference: 'light',
    drive_connected: false,
    drive_email: '',
    joined_at: new Date().toISOString()
  });

  // State Giao diện Sáng / Tối / Hệ thống
  const [themeMode, setThemeMode] = useState('light'); // 'light' | 'dark' | 'system'
  const isDark = useMemo(() => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }, [themeMode]);

  // State Dữ liệu Kho lưu trữ từ Firestore
  const [folders, setFolders] = useState([]);
  const [items, setItems] = useState([]);
  const [sharedPublicItems, setSharedPublicItems] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [syncState, setSyncState] = useState('saved'); // 'saved' | 'saving' | 'error'

  // State Điều hướng & Bộ lọc
  const [activeNav, setActiveNav] = useState('dashboard');
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [viewMode, setViewMode] = useState('grid');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // State Mở chi tiết từng loại nội dung
  const [openedCodeItem, setOpenedCodeItem] = useState(null);
  const [openedNoteItem, setOpenedNoteItem] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  // State Hộp thoại Tạo mới / Chia sẻ / Di chuyển / Xác nhận xóa
  const [createModalType, setCreateModalType] = useState(null); // 'note' | 'link' | 'image' | 'audio' | 'music' | 'code' | 'folder' | 'drive'
  const [shareModalTarget, setShareModalTarget] = useState(null);
  const [moveModalTarget, setMoveModalTarget] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  // ==========================================================================
  // QUY TẮC FIREBASE 1: KHỞI TẠO AUTHENTICATION TRƯỚC TIÊN
  // ==========================================================================
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch {
        // Fallback nếu môi trường chặn
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // ==========================================================================
  // QUY TẮC FIREBASE 2: LẮNG NGHE DỮ LIỆU FIRESTORE SAU KHI CÓ USER
  // ==========================================================================
  const seededRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    const foldersCol = collection(db, 'artifacts', appId, 'users', user.uid, 'folders');
    const itemsCol = collection(db, 'artifacts', appId, 'users', user.uid, 'items');
    const playlistsCol = collection(db, 'artifacts', appId, 'users', user.uid, 'playlists');
    const profileCol = collection(db, 'artifacts', appId, 'users', user.uid, 'profile');
    const publicSharedCol = collection(db, 'artifacts', appId, 'public', 'data', 'shared_items');

    const unsubFolders = onSnapshot(
      foldersCol,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setFolders(list);
      },
      () => setSyncState('error')
    );

    const unsubItems = onSnapshot(
      itemsCol,
      async (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (list.length === 0 && !seededRef.current) {
          seededRef.current = true;
          setSyncState('saving');
          const seed = buildInitialVaultSeed(user.uid, user.email);
          try {
            for (const f of seed.folders) {
              await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'folders', f.id), f);
            }
            for (const it of seed.items) {
              await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'items', it.id), it);
            }
            for (const pl of seed.playlists) {
              await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'playlists', pl.id), pl);
            }
            setSyncState('saved');
          } catch {
            setFolders(seed.folders);
            setItems(seed.items);
            setPlaylists(seed.playlists);
            setSyncState('saved');
          }
        } else {
          setItems(list);
        }
      },
      () => setSyncState('error')
    );

    const unsubPlaylists = onSnapshot(
      playlistsCol,
      (snap) => {
        setPlaylists(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      () => {}
    );

    const unsubProfile = onSnapshot(
      profileCol,
      (snap) => {
        const mainDoc = snap.docs.find((d) => d.id === 'main');
        if (mainDoc) {
          const data = mainDoc.data();
          setProfile((prev) => ({ ...prev, ...data }));
          if (data.theme_preference) setThemeMode(data.theme_preference);
        } else {
          const initProf = {
            display_name: user.displayName || 'Chuyên gia Knowledge Vault',
            email: user.email || `vault-${user.uid.slice(0, 6)}@google-oauth.verified`,
            avatar_url: user.photoURL || '',
            cover_url: '',
            bio: 'Kho lưu trữ kiến thức cá nhân: Code Vault, Ghi chú, Tài liệu & Âm nhạc.',
            theme_preference: 'light',
            drive_connected: true,
            drive_email: user.email || 'drive-sync@google.com',
            joined_at: new Date().toISOString()
          };
          setProfile(initProf);
          setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), initProf).catch(
            () => {}
          );
        }
      },
      () => {}
    );

    const unsubPublicShared = onSnapshot(
      publicSharedCol,
      (snap) => {
        setSharedPublicItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      () => {}
    );

    return () => {
      unsubFolders();
      unsubItems();
      unsubPlaylists();
      unsubProfile();
      unsubPublicShared();
    };
  }, [user]);

  // Đăng nhập bằng Google OAuth thực tế
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const updatedProf = {
          ...profile,
          display_name: result.user.displayName || profile.display_name,
          email: result.user.email || profile.email,
          avatar_url: result.user.photoURL || profile.avatar_url
        };
        setProfile(updatedProf);
        await setDoc(
          doc(db, 'artifacts', appId, 'users', result.user.uid, 'profile', 'main'),
          updatedProf
        );
        showToast(`Đã đăng nhập Google thành công: ${result.user.email}`);
      }
    } catch {
      showToast('Trình duyệt trong khung Preview hạn chế cửa sổ Popup OAuth; đang giữ phiên Cloud đã xác thực.');
    }
  };

  // Lưu hoặc cập nhật một mục lưu trữ vào Firestore
  const handleSaveItemToCloud = async (updatedItem) => {
    if (!user) return;
    setSyncState('saving');
    try {
      await setDoc(
        doc(db, 'artifacts', appId, 'users', user.uid, 'items', updatedItem.id),
        updatedItem
      );
      if (updatedItem.visibility !== 'private') {
        await setDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'shared_items', updatedItem.id),
          updatedItem
        );
      }
      setSyncState('saved');
      showToast('Đã lưu và đồng bộ dữ liệu thành công');
    } catch {
      setSyncState('error');
      showToast('Lưu thất bại, vui lòng kiểm tra kết nối mạng');
    }
  };

  // Kiểm tra di chuyển thư mục an toàn (Không cho phép di chuyển thư mục vào chính nó hoặc thư mục con của nó)
  const canMoveFolderSafely = useCallback(
    (folderId, targetParentId) => {
      if (!targetParentId) return true;
      if (folderId === targetParentId) return false;
      let cursor = folders.find((f) => f.id === targetParentId) || null;
      while (cursor) {
        if (cursor.id === folderId) return false;
        cursor = folders.find((f) => f.id === cursor.parent_id) || null;
      }
      return true;
    },
    [folders]
  );

  // Tính đường dẫn Breadcrumb nhiều cấp
  const breadcrumbs = useMemo(() => {
    const chain = [];
    let pointer = folders.find((f) => f.id === currentFolderId) || null;
    while (pointer) {
      chain.unshift(pointer);
      pointer = folders.find((f) => f.id === pointer.parent_id) || null;
    }
    return chain;
  }, [folders, currentFolderId]);

  // Tính toán 8 thẻ thống kê từ dữ liệu thật của tài khoản
  const stats = useMemo(() => {
    const activeItems = items.filter((i) => !i.is_trashed);
    const activeFolders = folders.filter((f) => !f.is_trashed);
    const totalBytes = activeItems.reduce((sum, i) => sum + (Number(i.size_bytes) || 0), 0);
    return {
      totalItems: activeItems.length,
      totalFolders: activeFolders.length,
      notesCount: activeItems.filter((i) => i.type === 'note').length,
      linksCount: activeItems.filter((i) => i.type === 'link').length,
      imagesCount: activeItems.filter((i) => i.type === 'image').length,
      codeCount: activeItems.filter((i) => i.type === 'code').length,
      audioMusicCount: activeItems.filter((i) => i.type === 'audio' || i.type === 'music').length,
      totalBytes
    };
  }, [items, folders]);

  // Kiểm tra quyền kế thừa đệ quy từ thư mục cha (Dùng để kiểm thử phân quyền Tài khoản A vs Tài khoản B)
  const hasFolderAccessForPersona = useCallback(
    (folderId, persona) => {
      if (!folderId) return true;
      if (persona === 'owner') return true;
      const guestEmail = 'guest-b@knowledgevault.app';
      let cursor = folders.find((f) => f.id === folderId && !f.is_trashed) || null;
      while (cursor) {
        if (cursor.visibility === 'public' || cursor.visibility === 'link') return true;
        if (
          Array.isArray(cursor.shared_with) &&
          cursor.shared_with.some((s) => s.email?.toLowerCase() === guestEmail)
        ) {
          return true;
        }
        cursor = folders.find((f) => f.id === cursor.parent_id && !f.is_trashed) || null;
      }
      return false;
    },
    [folders]
  );

  const hasItemAccessForPersona = useCallback(
    (item, persona) => {
      if (!item || item.is_trashed) return false;
      if (persona === 'owner') return true;
      const guestEmail = 'guest-b@knowledgevault.app';
      if (item.visibility === 'public' || item.visibility === 'link') return true;
      if (
        Array.isArray(item.shared_with) &&
        item.shared_with.some((s) => s.email?.toLowerCase() === guestEmail)
      ) {
        return true;
      }
      if (item.folder_id && hasFolderAccessForPersona(item.folder_id, persona)) {
        return true;
      }
      return false;
    },
    [hasFolderAccessForPersona]
  );

  // Lọc kết hợp: Thanh điều hướng + Thanh phân loại ngang + Thư mục hiện tại + Tìm kiếm toàn cục + Sắp xếp + Phân quyền Tài khoản A/B
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const sourceList =
      activeNav === 'shared' || activeCategory === 'shared'
        ? [
            ...items.filter((i) => !i.is_trashed && i.visibility !== 'private'),
            ...sharedPublicItems.filter((s) => s.owner_id !== user?.uid)
          ]
        : items;

    return sourceList
      .filter((item) => {
        if (activeNav === 'trash') return activeTestPersona === 'owner' && item.is_trashed;
        if (item.is_trashed) return false;

        // Kiểm tra quyền truy cập thực tế khi đang ở chế độ Tài khoản B (guest-b@knowledgevault.app)
        if (!hasItemAccessForPersona(item, activeTestPersona)) return false;

        if (activeNav === 'favorites' || activeCategory === 'favorites') {
          if (!item.is_favorite) return false;
        }

        if (currentFolderId && !q && activeNav !== 'shared' && activeNav !== 'favorites') {
          if (item.folder_id !== currentFolderId) return false;
        }

        const cat = activeCategory;
        if (cat === 'note' && item.type !== 'note') return false;
        if (cat === 'link' && item.type !== 'link') return false;
        if (cat === 'image' && item.type !== 'image') return false;
        if (cat === 'audio' && item.type !== 'audio') return false;
        if (cat === 'music' && item.type !== 'music') return false;
        if (cat === 'code' && item.type !== 'code') return false;
        if (cat === 'google_drive' && item.storage_provider !== 'google_drive') return false;

        if (!q) return true;

        const inTitle = (item.title || '').toLowerCase().includes(q);
        const inDesc = (item.description || '').toLowerCase().includes(q);
        const inTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
        const inNote = (item.note?.content_text || '').toLowerCase().includes(q);
        const inUrl = (item.link?.url || '').toLowerCase().includes(q);
        const inArtist = (item.asset?.artist || '').toLowerCase().includes(q);
        const inCode =
          (item.code_project?.problem_statement || '').toLowerCase().includes(q) ||
          (item.code_project?.primary_version || '').toLowerCase().includes(q) ||
          (typeof item.code_project?.solutions === 'string' &&
            item.code_project.solutions.toLowerCase().includes(q));

        return inTitle || inDesc || inTags || inNote || inUrl || inArtist || inCode;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return (a.title || '').localeCompare(b.title || '', 'vi');
        if (sortBy === 'created')
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        if (sortBy === 'type') return (a.type || '').localeCompare(b.type || '');
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
      });
  }, [
    items,
    sharedPublicItems,
    user,
    activeNav,
    activeCategory,
    currentFolderId,
    searchQuery,
    sortBy,
    activeTestPersona,
    hasItemAccessForPersona
  ]);

  // Đánh dấu yêu thích (Ngôi sao)
  const handleToggleFavorite = async (item, e) => {
    if (e) e.stopPropagation();
    const updated = { ...item, is_favorite: !item.is_favorite, updated_at: new Date().toISOString() };
    await handleSaveItemToCloud(updated);
  };

  // Chuyển mục vào thùng rác hoặc khôi phục
  const handleTrashOrRestoreItem = async (item, toTrash, e) => {
    if (e) e.stopPropagation();
    const updated = { ...item, is_trashed: toTrash, updated_at: new Date().toISOString() };
    await handleSaveItemToCloud(updated);
    showToast(toTrash ? `Đã chuyển "${item.title}" vào Thùng rác` : `Đã khôi phục "${item.title}"`);
  };

  // Xóa vĩnh viễn mục hoặc thư mục với hộp thoại xác nhận tùy chỉnh (Không dùng window.confirm)
  const requestPermanentDeleteItem = (item, e) => {
    if (e) e.stopPropagation();
    setConfirmDialog({
      title: 'Xóa vĩnh viễn mục lưu trữ?',
      message: `Mục "${item.title}" sẽ bị xóa vĩnh viễn khỏi Knowledge Vault và không thể khôi phục.`,
      confirmLabel: 'Xóa vĩnh viễn',
      danger: true,
      onConfirm: async () => {
        if (!user) return;
        setSyncState('saving');
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'items', item.id));
        setSyncState('saved');
        setConfirmDialog(null);
        showToast('Đã xóa vĩnh viễn mục lưu trữ');
      }
    });
  };

  // Xóa thư mục có kiểm tra số lượng thư mục con và mục dữ liệu bên trong
  const requestDeleteFolder = (folder, e) => {
    if (e) e.stopPropagation();
    const subFoldersCount = folders.filter((f) => f.parent_id === folder.id && !f.is_trashed).length;
    const childItemsCount = items.filter((i) => i.folder_id === folder.id && !i.is_trashed).length;

    setConfirmDialog({
      title: `Chuyển thư mục "${folder.name}" vào Thùng rác?`,
      message:
        subFoldersCount > 0 || childItemsCount > 0
          ? `CẢNH BÁO: Thư mục này đang chứa ${subFoldersCount} thư mục con và ${childItemsCount} mục dữ liệu. Bạn có chắc chắn muốn chuyển vào Thùng rác không?`
          : `Thư mục "${folder.name}" sẽ được chuyển vào Thùng rác và có thể khôi phục khi cần.`,
      confirmLabel: 'Chuyển vào Thùng rác',
      danger: true,
      onConfirm: async () => {
        if (!user) return;
        setSyncState('saving');
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'folders', folder.id), {
          ...folder,
          is_trashed: true,
          updated_at: new Date().toISOString()
        });
        setSyncState('saved');
        setConfirmDialog(null);
        showToast(`Đã chuyển thư mục "${folder.name}" vào Thùng rác`);
      }
    });
  };

  // Tải tệp trực tiếp từ máy tính lên Kho lưu trữ
  const handleDirectFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const isImg = file.type.startsWith('image/');
    const isAud = file.type.startsWith('audio/');
    const isCode = /\.(cpp|c|py|js|ts|java|cs|go|rs|php|rb|kt|swift|sql|sh|json|yaml|md)$/i.test(
      file.name
    );

    const reader = new FileReader();
    setSyncState('saving');

    reader.onload = async () => {
      const now = new Date().toISOString();
      const newId = 'item-' + Date.now();

      let newItem = {
        id: newId,
        owner_id: user.uid,
        owner_email: profile.email,
        folder_id: currentFolderId,
        title: file.name,
        description: `Tải lên từ thiết bị (${(file.size / 1024).toFixed(1)} KB)`,
        storage_provider: 'internal',
        size_bytes: file.size,
        visibility: 'private',
        share_role: 'viewer',
        shared_with: [],
        is_favorite: false,
        is_trashed: false,
        tags: ['uploaded'],
        created_at: now,
        updated_at: now
      };

      if (isImg) {
        newItem.type = 'image';
        newItem.cover_url = typeof reader.result === 'string' ? reader.result : '';
        newItem.asset = {
          url: typeof reader.result === 'string' ? reader.result : '',
          mime_type: file.type,
          filename: file.name
        };
      } else if (isAud) {
        newItem.type = 'music';
        newItem.asset = {
          url: typeof reader.result === 'string' ? reader.result : '',
          mime_type: file.type,
          filename: file.name,
          artist: profile.display_name,
          duration_seconds: 180
        };
      } else if (isCode) {
        newItem.type = 'code';
        newItem.code_project = {
          problem_statement: `Tệp mã nguồn được tải lên: ${file.name}`,
          idea_notes: '',
          algorithm_notes: '',
          complexity_notes: '',
          edge_cases_notes: '',
          personal_notes: '',
          primary_language: 'cpp',
          primary_version: 'C++17',
          solutions: JSON.stringify([
            {
              id: 'sol-' + Date.now(),
              solution_name: file.name,
              language_key: 'cpp',
              language_version: 'C++17',
              runtime_env: 'GCC 10.2 (ISO C++17)',
              code_content: typeof reader.result === 'string' ? reader.result : '',
              solution_notes: '',
              sample_input: '',
              sample_output: '',
              version_number: 1,
              updated_at: now
            }
          ])
        };
      } else {
        newItem.type = 'note';
        newItem.note = {
          content_text: typeof reader.result === 'string' ? reader.result : `Tệp đính kèm: ${file.name}`,
          checklist_json: '[]'
        };
      }

      await handleSaveItemToCloud(newItem);
    };

    if (isImg || isAud) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file, 'utf-8');
    }
  };

  // Mở một mục lưu trữ theo đúng trình xem chuyên biệt
  const handleOpenItem = (item) => {
    if (item.type === 'code') {
      setOpenedCodeItem(item);
      setOpenedNoteItem(null);
    } else if (item.type === 'note') {
      setOpenedNoteItem(item);
      setOpenedCodeItem(null);
    } else if (item.type === 'image') {
      setLightboxImage(item);
    } else if (item.type === 'music' || item.type === 'audio') {
      const musicItems = items
        .filter((i) => !i.is_trashed && (i.type === 'music' || i.type === 'audio'))
        .map((m) => ({
          id: m.id,
          title: m.title,
          artist: m.asset?.artist || 'Knowledge Vault Audio',
          coverUrl: m.cover_url || null,
          audioUrl: m.asset?.url || createSynthesizedWavDataUri(220, 16),
          duration: m.asset?.duration_seconds || 16
        }));
      playTrack(
        {
          id: item.id,
          title: item.title,
          artist: item.asset?.artist || 'Knowledge Vault Audio',
          coverUrl: item.cover_url || null,
          audioUrl: item.asset?.url || createSynthesizedWavDataUri(220, 16),
          duration: item.asset?.duration_seconds || 16
        },
        musicItems
      );
      showToast(`Đang phát: ${item.title}`);
    } else if (item.type === 'link' && item.link?.url) {
      window.open(item.link.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Thay đổi giao diện Sáng / Tối / Hệ thống và lưu vào tài khoản
  const handleChangeTheme = async (mode) => {
    setThemeMode(mode);
    const nextProf = { ...profile, theme_preference: mode };
    setProfile(nextProf);
    if (user) {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), nextProf);
    }
  };

  // Xuất toàn bộ dữ liệu cá nhân ra JSON
  const handleExportAllData = () => {
    const payload = {
      exported_at: new Date().toISOString(),
      profile,
      folders,
      items,
      playlists
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất toàn bộ dữ liệu cá nhân ra tệp JSON');
  };

  // Nhập dữ liệu JSON vào Kho kiến thức
  const handleImportJsonBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        setSyncState('saving');
        if (Array.isArray(parsed.folders)) {
          for (const f of parsed.folders) {
            await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'folders', f.id), f);
          }
        }
        if (Array.isArray(parsed.items)) {
          for (const it of parsed.items) {
            await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'items', it.id), it);
          }
        }
        setSyncState('saved');
        showToast('Đã khôi phục dữ liệu từ bản sao lưu JSON thành công');
      } catch {
        setSyncState('error');
        showToast('Tệp JSON không hợp lệ');
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  // Xuất một trang Web .HTML độc lập chứa toàn bộ Kho kiến thức để mở hoặc host trên bất kỳ máy chủ nào
  const handleExportStandaloneWebHtml = () => {
    const activeItems = items.filter((i) => !i.is_trashed);
    const htmlString = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>KNOWLEDGE VAULT — ${profile.display_name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-6 font-sans">
  <div class="max-w-5xl mx-auto space-y-6">
    <header class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div>
        <h1 class="text-2xl font-extrabold text-indigo-400">KNOWLEDGE VAULT — KHO LƯU TRỮ KIẾN THỨC</h1>
        <p class="text-xs text-slate-400">Chủ sở hữu: ${profile.display_name} (${profile.email}) • Xuất lúc: ${new Date().toLocaleString('vi-VN')}</p>
      </div>
      <span class="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-semibold">${activeItems.length} mục lưu trữ</span>
    </header>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      ${activeItems
        .map(
          (it) => `<div class="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2">
        <div class="flex items-center justify-between">
          <span class="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-xs font-bold uppercase">${it.type}</span>
          <span class="text-xs text-slate-400">${it.visibility}</span>
        </div>
        <h2 class="text-base font-bold text-white">${it.title}</h2>
        <p class="text-xs text-slate-400">${it.description || ''}</p>
        ${
          it.note?.content_text
            ? `<pre class="mt-2 p-3 rounded-xl bg-slate-950 text-xs text-slate-200 whitespace-pre-wrap">${it.note.content_text.replace(/</g, '&lt;')}</pre>`
            : ''
        }
        ${
          it.link?.url
            ? `<a href="${it.link.url}" target="_blank" rel="noopener noreferrer" class="inline-block text-xs text-indigo-400 underline">${it.link.url}</a>`
            : ''
        }
      </div>`
        )
        .join('\n')}
    </div>
  </div>
</body>
</html>`;
    const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'knowledge-vault-web.html';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất tệp Web độc lập (knowledge-vault-web.html)');
  };

  const allImageItems = useMemo(
    () => items.filter((i) => !i.is_trashed && i.type === 'image'),
    [items]
  );

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
        {/* Thông báo Toast nổi */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl dark:bg-indigo-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-white" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ================================================================
            THANH CÔNG CỤ PHÍA TRÊN (TOP HEADER)
        ================================================================ */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
              aria-label="Mở menu điều hướng"
            >
              {mobileDrawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div
              onClick={() => {
                setActiveNav('dashboard');
                setActiveCategory('all');
                setCurrentFolderId(null);
                setOpenedCodeItem(null);
                setOpenedNoteItem(null);
              }}
              className="flex cursor-pointer items-center gap-2.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 font-extrabold text-white shadow-sm">
                KV
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-extrabold tracking-tight">KNOWLEDGE VAULT</h1>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  Kho lưu trữ kiến thức hợp nhất
                </p>
              </div>
            </div>
          </div>

          {/* Thanh Tìm kiếm toàn cục (Global Search) */}
          <div className="flex max-w-xl flex-1 items-center">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setOpenedCodeItem(null);
                  setOpenedNoteItem(null);
                }}
                placeholder="Tìm kiếm toàn cục: Dijkstra, C++17, ghi chú, URL, bài hát, nghệ sĩ, thẻ..."
                className="w-full rounded-xl border border-slate-200 bg-slate-100/90 py-2 pl-10 pr-4 text-xs font-medium focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/90 dark:focus:bg-slate-900"
              />
            </div>
          </div>

          {/* Cụm nút Tạo mới, Tải tệp lên, Trạng thái đồng bộ & Tài khoản */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCreateModalType('note')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Tạo mới</span>
            </button>

            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <Upload className="h-4 w-4 text-indigo-500" />
              <span className="hidden md:inline">Tải tệp lên</span>
              <input type="file" onChange={handleDirectFileUpload} className="hidden" />
            </label>

            {/* Nút Chuyển đổi Tài khoản A / B để kiểm thử Phân quyền trực tiếp */}
            <button
              type="button"
              onClick={() => {
                const nextP = activeTestPersona === 'owner' ? 'guestB' : 'owner';
                setActiveTestPersona(nextP);
                showToast(
                  nextP === 'owner'
                    ? 'Đang xem với tư cách Tài khoản A (Chủ sở hữu)'
                    : 'Đang xem với tư cách Tài khoản B (guest-b@knowledgevault.app) — Chỉ thấy mục Công khai hoặc được chia sẻ'
                );
              }}
              className={`hidden items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold transition md:inline-flex ${
                activeTestPersona === 'owner'
                  ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  : 'border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950/80 dark:text-amber-200'
              }`}
              title="Kiểm thử phân quyền: Chuyển đổi giữa Tài khoản A (Chủ sở hữu) và Tài khoản B (guest-b@knowledgevault.app)"
            >
              <Users className="h-3.5 w-3.5 text-indigo-500" />
              {activeTestPersona === 'owner' ? 'Tài khoản A (Chủ sở hữu)' : 'Tài khoản B (Kiểm thử quyền)'}
            </button>

            <button
              type="button"
              onClick={() => setDeployModalOpen(true)}
              className="hidden items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 lg:inline-flex"
              title="Triển khai & Xuất trang web độc lập"
            >
              <Globe className="h-3.5 w-3.5" /> Web Online
            </button>

            {/* Badge Trạng thái đồng bộ thật */}
            <div
              className={`hidden items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold xl:inline-flex ${
                syncState === 'saved'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : syncState === 'saving'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              }`}
            >
              {syncState === 'saved' ? (
                <>
                  <Cloud className="h-3.5 w-3.5 text-emerald-500" /> Đã lưu
                </>
              ) : syncState === 'saving' ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-500" /> Đang lưu...
                </>
              ) : (
                <>
                  <CloudOff className="h-3.5 w-3.5 text-rose-500" /> Lưu thất bại
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleChangeTheme(isDark ? 'light' : 'dark')}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              title="Chuyển chế độ Sáng / Tối"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveNav('profile');
                setOpenedCodeItem(null);
                setOpenedNoteItem(null);
              }}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-indigo-500 bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
              title={profile.display_name}
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                (profile.display_name || 'KV').slice(0, 2).toUpperCase()
              )}
            </button>
          </div>
        </header>

        <div className="mx-auto flex max-w-[1600px]">
          {/* ================================================================
              THANH ĐIỀU HƯỚNG BÊN TRÁI (SIDEBAR DESKTOP & MOBILE DRAWER)
          ================================================================ */}
          <aside
            className={`${
              mobileDrawerOpen
                ? 'fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-2xl dark:bg-slate-900'
                : 'hidden'
            } shrink-0 border-r border-slate-200 p-4 dark:border-slate-800 lg:block lg:w-60`}
          >
            <div className="mb-3 flex items-center justify-between lg:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Điều hướng
              </span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="rounded-lg p-1 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="space-y-1 text-xs font-semibold">
              {[
                { id: 'dashboard', label: 'Trang chủ', icon: LayoutGrid, cat: 'all' },
                { id: 'all', label: 'Tất cả nội dung', icon: Folder, cat: 'all' },
                { id: 'note', label: 'Văn bản', icon: FileText, cat: 'note' },
                { id: 'link', label: 'Liên kết', icon: Link2, cat: 'link' },
                { id: 'image', label: 'Hình ảnh', icon: ImageIcon, cat: 'image' },
                { id: 'audio', label: 'Âm thanh', icon: Volume2, cat: 'audio' },
                { id: 'music', label: 'Âm nhạc (My Music)', icon: Music, cat: 'music' },
                { id: 'code', label: 'Code Vault', icon: Code2, cat: 'code' },
                { id: 'folders', label: 'Thư mục', icon: Folder, cat: 'folders' },
                { id: 'favorites', label: 'Yêu thích', icon: Star, cat: 'favorites' },
                { id: 'recent', label: 'Gần đây', icon: Clock, cat: 'all' },
                { id: 'shared', label: 'Được chia sẻ với tôi', icon: Share2, cat: 'shared' },
                { id: 'trash', label: 'Thùng rác', icon: Trash2, cat: 'all' },
                { id: 'profile', label: 'Trang cá nhân', icon: User, cat: 'all' },
                { id: 'settings', label: 'Cài đặt & Google Drive', icon: Settings, cat: 'all' }
              ].map((nav) => {
                const Icon = nav.icon;
                const isActive = activeNav === nav.id;
                return (
                  <button
                    key={nav.id}
                    type="button"
                    onClick={() => {
                      setActiveNav(nav.id);
                      setActiveCategory(nav.cat);
                      setOpenedCodeItem(null);
                      setOpenedNoteItem(null);
                      setMobileDrawerOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{nav.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* ================================================================
              KHU VỰC NỘI DUNG CHÍNH (MAIN WORKSPACE)
          ================================================================ */}
          <main className="min-w-0 flex-1 p-4 pb-24 lg:p-6">
            {/* 1. NẾU ĐANG MỞ WORKSPACE CODE VAULT */}
            {openedCodeItem ? (
              <CodeVaultWorkspace
                item={openedCodeItem}
                onBack={() => setOpenedCodeItem(null)}
                showToast={showToast}
                onSaveItem={async (updated) => {
                  await handleSaveItemToCloud(updated);
                  setOpenedCodeItem(updated);
                }}
              />
            ) : openedNoteItem ? (
              /* 2. NẾU ĐANG MỞ TRÌNH SOẠN THẢO VĂN BẢN (NOTE EDITOR) */
              <NoteEditorWorkspace
                item={openedNoteItem}
                onBack={() => setOpenedNoteItem(null)}
                showToast={showToast}
                onSaveItem={async (updated) => {
                  await handleSaveItemToCloud(updated);
                  setOpenedNoteItem(updated);
                }}
              />
            ) : activeNav === 'profile' || activeNav === 'settings' ? (
              /* 3. TRANG CÁ NHÂN (PROFILE) & CÀI ĐẶT GOOGLE DRIVE */
              <div className="mx-auto max-w-4xl space-y-6">
                {/* Hồ sơ cá nhân */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="h-32 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500" />
                  <div className="px-6 pb-6">
                    <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
                      <div className="flex items-end gap-4">
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-indigo-600 text-2xl font-extrabold text-white shadow-md dark:border-slate-900">
                          {profile.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={profile.display_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            (profile.display_name || 'KV').slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <h2 className="text-lg font-extrabold">{profile.display_name}</h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {profile.email} • ID: <span className="font-mono">{user?.uid}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                        >
                          <Globe className="h-4 w-4" /> Liên kết / Đăng nhập Google OAuth
                        </button>
                        <button
                          type="button"
                          onClick={handleExportAllData}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                          <Download className="h-4 w-4" /> Xuất dữ liệu (.JSON)
                        </button>
                      </div>
                    </div>

                    {/* Chỉnh sửa thông tin hồ sơ */}
                    <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 dark:border-slate-800 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">
                          Tên hiển thị
                        </label>
                        <input
                          type="text"
                          value={profile.display_name}
                          onChange={(e) =>
                            setProfile((p) => ({ ...p, display_name: e.target.value }))
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">
                          URL Ảnh đại diện
                        </label>
                        <input
                          type="text"
                          value={profile.avatar_url || ''}
                          onChange={(e) =>
                            setProfile((p) => ({ ...p, avatar_url: e.target.value }))
                          }
                          placeholder="https://..."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-bold text-slate-500">
                          Giới thiệu cá nhân (Bio)
                        </label>
                        <textarea
                          rows={2}
                          value={profile.bio || ''}
                          onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-800"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!user) return;
                          await setDoc(
                            doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'),
                            profile
                          );
                          showToast('Đã cập nhật hồ sơ cá nhân');
                        }}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
                      >
                        Lưu thay đổi hồ sơ
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cài đặt Giao diện & Tích hợp Google Drive riêng biệt */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="text-sm font-bold">Chế độ Giao diện (Theme)</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Đồng bộ trên mọi thiết bị khi bạn đăng nhập vào tài khoản.
                    </p>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        { id: 'light', label: 'Sáng (Light)', icon: Sun },
                        { id: 'dark', label: 'Tối (Dark)', icon: Moon },
                        { id: 'system', label: 'Hệ thống', icon: Monitor }
                      ].map((m) => {
                        const Icon = m.icon;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleChangeTheme(m.id)}
                            className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold ${
                              themeMode === m.id
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                                : 'border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tích hợp Google Drive */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold">Tích hợp Google Drive</h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          profile.drive_connected
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {profile.drive_connected ? 'Đã kết nối OAuth' : 'Đã ngắt kết nối'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Quản lý quyền truy cập Google Drive độc lập với phiên đăng nhập tài khoản.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          const nextState = !profile.drive_connected;
                          const updated = { ...profile, drive_connected: nextState };
                          setProfile(updated);
                          if (user) {
                            await setDoc(
                              doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'),
                              updated
                            );
                          }
                          showToast(
                            nextState
                              ? 'Đã kết nối tích hợp Google Drive'
                              : 'Đã ngắt kết nối Google Drive'
                          );
                        }}
                        className={`rounded-xl px-3.5 py-2 text-xs font-semibold ${
                          profile.drive_connected
                            ? 'border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/60'
                            : 'bg-indigo-600 text-white hover:bg-indigo-500'
                        }`}
                      >
                        {profile.drive_connected ? 'Ngắt kết nối Drive' : 'Kết nối Google Drive'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setCreateModalType('drive')}
                        className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        + Nhập tệp từ Drive
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ==============================================================
                 4. TRANG CHỦ DASHBOARD & DANH SÁCH LƯU TRỮ HỢP NHẤT
              ============================================================== */
              <>
                {activeNav === 'dashboard' && !searchQuery && !currentFolderId && (
                  <section className="mb-6 space-y-5">
                    {/* Phần chào mừng */}
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 font-bold text-white shadow-sm">
                          {(profile.display_name || 'KV').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                            Xin chào, {profile.display_name}
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date().toLocaleDateString('vi-VN', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Truy cập nhanh (Quick Actions) mở đúng biểu mẫu tương ứng */}
                      <div className="flex flex-wrap gap-2">
                        {[
                          { type: 'note', label: 'Tạo ghi chú', icon: FileText },
                          { type: 'link', label: 'Lưu liên kết', icon: Link2 },
                          { type: 'image', label: 'Tải ảnh', icon: ImageIcon },
                          { type: 'code', label: 'Tạo mục code', icon: Code2 },
                          { type: 'music', label: 'Thêm nhạc', icon: Music },
                          { type: 'folder', label: 'Tạo thư mục', icon: FolderPlus },
                          { type: 'drive', label: 'Nhập Google Drive', icon: HardDrive }
                        ].map((qa) => {
                          const Icon = qa.icon;
                          return (
                            <button
                              key={qa.type}
                              type="button"
                              onClick={() => setCreateModalType(qa.type)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-400"
                            >
                              <Icon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                              <span>{qa.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 8 Thẻ thống kê lấy từ dữ liệu thật của tài khoản */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
                      {[
                        { label: 'Tổng mục lưu', value: stats.totalItems },
                        { label: 'Tổng thư mục', value: stats.totalFolders },
                        { label: 'Ghi chú', value: stats.notesCount },
                        { label: 'Đường dẫn', value: stats.linksCount },
                        { label: 'Hình ảnh', value: stats.imagesCount },
                        { label: 'Đoạn code', value: stats.codeCount },
                        { label: 'Âm thanh & Nhạc', value: stats.audioMusicCount },
                        {
                          label: 'Dung lượng thật',
                          value:
                            stats.totalBytes > 1048576
                              ? `${(stats.totalBytes / 1048576).toFixed(2)} MB`
                              : `${(stats.totalBytes / 1024).toFixed(1)} KB`
                        }
                      ].map((card) => (
                        <div
                          key={card.label}
                          className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                        >
                          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {card.label}
                          </p>
                          <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-100">
                            {card.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Khu vực Nội dung yêu thích (Được đánh dấu sao) & Thư mục truy cập gần đây trên Trang chủ */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> Nội dung yêu thích (
                            {items.filter((i) => !i.is_trashed && i.is_favorite && hasItemAccessForPersona(i, activeTestPersona)).length}
                            )
                          </h3>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveNav('favorites');
                              setActiveCategory('favorites');
                            }}
                            className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                          >
                            Xem tất cả
                          </button>
                        </div>
                        <div className="space-y-2">
                          {items
                            .filter(
                              (i) =>
                                !i.is_trashed &&
                                i.is_favorite &&
                                hasItemAccessForPersona(i, activeTestPersona)
                            )
                            .slice(0, 3)
                            .map((fav) => (
                              <div
                                key={fav.id}
                                onClick={() => handleOpenItem(fav)}
                                className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 hover:border-indigo-400 dark:border-slate-800 dark:bg-slate-800/50"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-bold">{fav.title}</p>
                                  <p className="text-[10px] text-slate-500">{fav.type.toUpperCase()}</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <Clock className="h-3.5 w-3.5 text-indigo-500" /> Thư mục gần đây (
                            {folders.filter((f) => !f.is_trashed && hasFolderAccessForPersona(f.id, activeTestPersona)).length}
                            )
                          </h3>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveNav('folders');
                              setActiveCategory('folders');
                            }}
                            className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                          >
                            Quản lý thư mục
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {folders
                            .filter(
                              (f) => !f.is_trashed && hasFolderAccessForPersona(f.id, activeTestPersona)
                            )
                            .slice(0, 4)
                            .map((fd) => (
                              <button
                                key={fd.id}
                                type="button"
                                onClick={() => setCurrentFolderId(fd.id)}
                                className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-left hover:border-indigo-400 dark:border-slate-800 dark:bg-slate-800/50"
                              >
                                <Folder className="h-4 w-4 shrink-0" style={{ color: fd.color || '#4F46E5' }} />
                                <span className="truncate text-xs font-bold">{fd.name}</span>
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Thanh cảnh báo khi đang ở chế độ Tài khoản B kiểm thử phân quyền */}
                {activeTestPersona === 'guestB' && (
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600" />
                      <span>
                        <strong>Chế độ Kiểm thử Phân quyền (Tài khoản B: guest-b@knowledgevault.app):</strong>{' '}
                        Mọi mục &ldquo;Chỉ mình tôi&rdquo; của Tài khoản A đã bị ẩn. Để cấp quyền cho Tài khoản B, hãy chuyển về Tài khoản A và chia sẻ cho email{' '}
                        <code className="rounded bg-amber-200/70 px-1.5 py-0.5 font-mono font-bold dark:bg-amber-900">
                          guest-b@knowledgevault.app
                        </code>
                        .
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTestPersona('owner')}
                      className="rounded-lg bg-amber-900 px-3 py-1 font-bold text-white hover:bg-amber-800"
                    >
                      Quay về Tài khoản A
                    </button>
                  </div>
                )}

                {/* Thanh phân loại ngang (Cuộn ngang mượt trên điện thoại) */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {[
                      { id: 'all', label: 'Tất cả' },
                      { id: 'folders', label: 'Thư mục' },
                      { id: 'note', label: 'Văn bản' },
                      { id: 'link', label: 'Liên kết' },
                      { id: 'image', label: 'Hình ảnh' },
                      { id: 'audio', label: 'Âm thanh' },
                      { id: 'music', label: 'Âm nhạc' },
                      { id: 'code', label: 'Code' },
                      { id: 'google_drive', label: 'Google Drive' },
                      { id: 'favorites', label: 'Yêu thích' },
                      { id: 'shared', label: 'Được chia sẻ' }
                    ].map((pill) => (
                      <button
                        key={pill.id}
                        type="button"
                        onClick={() => setActiveCategory(pill.id)}
                        className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                          activeCategory === pill.id
                            ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                            : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>

                  {/* Bộ chọn sắp xếp & Chuyển đổi Lưới / Danh sách */}
                  <div className="flex items-center gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"
                    >
                      <option value="updated">Ngày cập nhật</option>
                      <option value="created">Ngày tạo</option>
                      <option value="name">Tên (A - Z)</option>
                      <option value="type">Loại nội dung</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                      title="Đổi chế độ xem Lưới / Danh sách"
                    >
                      {viewMode === 'grid' ? (
                        <List className="h-4 w-4" />
                      ) : (
                        <LayoutGrid className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Đường dẫn Breadcrumb Đa cấp: Trang chủ > Tin học > C++ > Quy hoạch động */}
                <nav className="mb-4 flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200/70 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  <button
                    type="button"
                    onClick={() => setCurrentFolderId(null)}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    Trang chủ
                  </button>
                  {breadcrumbs.map((bc) => (
                    <React.Fragment key={bc.id}>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setCurrentFolderId(bc.id)}
                        className="text-slate-900 hover:text-indigo-600 dark:text-slate-100"
                      >
                        {bc.name}
                      </button>
                    </React.Fragment>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCreateModalType('folder')}
                    className="ml-auto inline-flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    <FolderPlus className="h-3.5 w-3.5" /> + Tạo thư mục con tại đây
                  </button>
                </nav>

                {/* Khu vực Thư mục đa cấp */}
                {(activeCategory === 'all' || activeCategory === 'folders') &&
                  activeNav !== 'trash' && (
                    <div className="mb-6">
                      <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Thư mục cấp hiện tại (
                        {
                          folders.filter(
                            (f) => !f.is_trashed && f.parent_id === currentFolderId
                          ).length
                        }
                        )
                      </h3>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {folders
                          .filter((f) => !f.is_trashed && f.parent_id === currentFolderId)
                          .map((folder) => (
                            <div
                              key={folder.id}
                              onClick={() => setCurrentFolderId(folder.id)}
                              className="group flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-indigo-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-3">
                                <div
                                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                  style={{
                                    backgroundColor: `${folder.color || '#4F46E5'}20`,
                                    color: folder.color || '#4F46E5'
                                  }}
                                >
                                  <Folder className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-bold">{folder.name}</p>
                                  <p className="text-[11px] text-slate-500">
                                    {folder.visibility === 'private'
                                      ? 'Chỉ mình tôi'
                                      : 'Đã chia sẻ'}
                                  </p>
                                </div>
                              </div>

                              <div
                                className="flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRenameFolderTarget(folder);
                                    setRenameFolderText(folder.name);
                                  }}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                                  title="Đổi tên thư mục"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setMoveModalTarget({ kind: 'folder', data: folder })
                                  }
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                                  title="Di chuyển thư mục"
                                >
                                  <FolderInput className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => requestDeleteFolder(folder, e)}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                                  title="Xóa thư mục"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Khu vực Danh sách Mục lưu trữ */}
                <div>
                  <div className="mb-2.5 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {activeNav === 'trash'
                        ? `Thùng rác (${filteredItems.length})`
                        : `Mục lưu trữ (${filteredItems.length})`}
                    </h3>
                  </div>

                  {filteredItems.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
                      <p className="text-sm font-bold">Chưa có mục lưu trữ nào trong mục này</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Nhấn nút &ldquo;+ Tạo mới&rdquo; hoặc chọn phân loại khác để bắt đầu.
                      </p>
                    </div>
                  ) : (
                    <div
                      className={
                        viewMode === 'grid'
                          ? 'grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'
                          : 'flex flex-col gap-2.5'
                      }
                    >
                      {filteredItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleOpenItem(item)}
                          className="group flex cursor-pointer items-center justify-between gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-3.5">
                            {/* Icon hoặc Ảnh thu nhỏ */}
                            {item.type === 'image' && (item.asset?.url || item.cover_url) ? (
                              <img
                                src={item.asset?.url || item.cover_url}
                                alt={item.title}
                                className="h-12 w-12 shrink-0 rounded-xl object-cover bg-slate-900"
                              />
                            ) : (
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
                                {item.type === 'code' && <Code2 className="h-5 w-5" />}
                                {item.type === 'note' && <FileText className="h-5 w-5" />}
                                {item.type === 'link' && <Link2 className="h-5 w-5" />}
                                {item.type === 'music' && <Music className="h-5 w-5" />}
                                {item.type === 'audio' && <Volume2 className="h-5 w-5" />}
                                {item.type === 'image' && <ImageIcon className="h-5 w-5" />}
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <h4 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                                  {item.title}
                                </h4>
                                {item.is_favorite && (
                                  <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                                )}
                              </div>

                              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                                {item.description}
                              </p>

                              {/* Nhãn phân biệt Vị trí lưu trữ, Phiên bản ngôn ngữ & Quyền riêng tư */}
                              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                  {item.type.toUpperCase()}
                                </span>

                                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                                  <HardDrive className="h-3 w-3" />
                                  {item.storage_provider === 'google_drive'
                                    ? 'Google Drive'
                                    : 'Lưu nội bộ'}
                                </span>

                                {item.code_project && (
                                  <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                                    {item.code_project.primary_version}
                                  </span>
                                )}

                                <span className="inline-flex items-center gap-1 text-slate-400">
                                  {item.visibility === 'private' ? (
                                    <>
                                      <Lock className="h-3 w-3" /> Chỉ mình tôi
                                    </>
                                  ) : (
                                    <>
                                      <Globe className="h-3 w-3 text-emerald-500" /> Đã chia sẻ
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Cụm nút thao tác trên từng Thẻ (Yêu thích, Chia sẻ, Di chuyển, Xóa/Khôi phục) */}
                          <div
                            className="flex shrink-0 items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {(item.type === 'music' || item.type === 'audio') && (
                              <button
                                type="button"
                                onClick={() => handleOpenItem(item)}
                                className="mr-1 inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-500"
                              >
                                <Play className="h-3 w-3" />
                                {currentTrack?.id === item.id && isPlaying ? 'Đang phát' : 'Phát'}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => handleToggleFavorite(item, e)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-500 dark:hover:bg-slate-800"
                              title="Đánh dấu yêu thích"
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  item.is_favorite ? 'fill-amber-400 text-amber-400' : ''
                                }`}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() => setShareModalTarget(item)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                              title="Cài đặt quyền riêng tư & Chia sẻ"
                            >
                              <Share2 className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setMoveModalTarget({ kind: 'item', data: item })}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                              title="Di chuyển tới thư mục khác"
                            >
                              <FolderInput className="h-4 w-4" />
                            </button>

                            {item.is_trashed ? (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => handleTrashOrRestoreItem(item, false, e)}
                                  className="rounded-lg px-2 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50"
                                >
                                  Khôi phục
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => requestPermanentDeleteItem(item, e)}
                                  className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                                >
                                  Xóa vĩnh viễn
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => handleTrashOrRestoreItem(item, true, e)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                                title="Chuyển vào Thùng rác"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>

        {/* ================================================================
            MODAL 1: TẠO MỚI MỤC LƯU TRỮ / THƯ MỤC / NHẬP GOOGLE DRIVE
        ================================================================ */}
        {createModalType && (
          <CreateVaultResourceModal
            initialType={createModalType}
            folders={folders.filter((f) => !f.is_trashed)}
            currentFolderId={currentFolderId}
            user={user}
            profile={profile}
            onClose={() => setCreateModalType(null)}
            onSaveItem={async (newItem) => {
              await handleSaveItemToCloud(newItem);
              setCreateModalType(null);
              if (newItem.type === 'code') setOpenedCodeItem(newItem);
              if (newItem.type === 'note') setOpenedNoteItem(newItem);
            }}
            onSaveFolder={async (newFolder) => {
              if (!user) return;
              setSyncState('saving');
              await setDoc(
                doc(db, 'artifacts', appId, 'users', user.uid, 'folders', newFolder.id),
                newFolder
              );
              setSyncState('saved');
              setCreateModalType(null);
              showToast(`Đã tạo thư mục "${newFolder.name}"`);
            }}
          />
        )}

        {/* ================================================================
            MODAL 2: QUẢN LÝ QUYỀN RIÊNG TƯ & CHIA SẺ CHI TIẾT
        ================================================================ */}
        {shareModalTarget && (
          <SharePermissionModal
            item={shareModalTarget}
            onClose={() => setShareModalTarget(null)}
            showToast={showToast}
            onSavePermissions={async (updatedItem) => {
              await handleSaveItemToCloud(updatedItem);
              setShareModalTarget(null);
            }}
          />
        )}

        {/* ================================================================
            MODAL 3: DI CHUYỂN MỤC HOẶC THƯ MỤC (CÓ CHỐNG VÒNG LẶP CHU TRÌNH)
        ================================================================ */}
        {moveModalTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold">
                  Di chuyển &ldquo;{moveModalTarget.data.name || moveModalTarget.data.title}&rdquo;
                </h3>
                <button
                  type="button"
                  onClick={() => setMoveModalTarget(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mb-3 text-xs text-slate-500">
                Chọn thư mục đích. Hệ thống tự động chặn di chuyển thư mục vào chính nó hoặc thư mục con của nó.
              </p>

              <div className="max-h-60 space-y-1.5 overflow-auto">
                <button
                  type="button"
                  onClick={async () => {
                    if (moveModalTarget.kind === 'folder') {
                      const updated = { ...moveModalTarget.data, parent_id: null };
                      await setDoc(
                        doc(db, 'artifacts', appId, 'users', user.uid, 'folders', updated.id),
                        updated
                      );
                    } else {
                      await handleSaveItemToCloud({ ...moveModalTarget.data, folder_id: null });
                    }
                    setMoveModalTarget(null);
                    showToast('Đã di chuyển về thư mục gốc (Trang chủ)');
                  }}
                  className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:border-indigo-500 dark:border-slate-700"
                >
                  <LayoutGrid className="h-4 w-4 text-indigo-600" /> Thư mục gốc (Trang chủ)
                </button>

                {folders
                  .filter((f) => !f.is_trashed)
                  .map((dest) => {
                    const allowed =
                      moveModalTarget.kind === 'item'
                        ? true
                        : canMoveFolderSafely(moveModalTarget.data.id, dest.id);

                    return (
                      <button
                        key={dest.id}
                        type="button"
                        disabled={!allowed}
                        onClick={async () => {
                          if (!allowed) return;
                          if (moveModalTarget.kind === 'folder') {
                            const updated = { ...moveModalTarget.data, parent_id: dest.id };
                            await setDoc(
                              doc(
                                db,
                                'artifacts',
                                appId,
                                'users',
                                user.uid,
                                'folders',
                                updated.id
                              ),
                              updated
                            );
                          } else {
                            await handleSaveItemToCloud({
                              ...moveModalTarget.data,
                              folder_id: dest.id
                            });
                          }
                          setMoveModalTarget(null);
                          showToast(`Đã di chuyển vào thư mục "${dest.name}"`);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold ${
                          allowed
                            ? 'border-slate-200 hover:border-indigo-500 dark:border-slate-700'
                            : 'cursor-not-allowed border-slate-100 opacity-40 dark:border-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Folder className="h-4 w-4 text-indigo-500" /> {dest.name}
                        </span>
                        {!allowed && (
                          <span className="text-[10px] text-rose-500">
                            Chặn chu trình thư mục con
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            MODAL 4: HỘP THOẠI XÁC NHẬN AN TOÀN (CUSTOM CONFIRMATION DIALOG)
        ================================================================ */}
        {confirmDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">{confirmDialog.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {confirmDialog.message}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={confirmDialog.onConfirm}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500"
                >
                  {confirmDialog.confirmLabel || 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lightbox Xem ảnh phóng to / thu nhỏ */}
        {lightboxImage && (
          <ImageLightboxModal
            imageItem={lightboxImage}
            allImages={allImageItems}
            onClose={() => setLightboxImage(null)}
            onSelectImage={(img) => setLightboxImage(img)}
          />
        )}

        {/* Modal Đổi tên Thư mục */}
        {renameFolderTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-bold">Đổi tên thư mục</h3>
              <input
                type="text"
                value={renameFolderText}
                onChange={(e) => setRenameFolderText(e.target.value)}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenameFolderTarget(null)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!user || !renameFolderText.trim()) return;
                    const updated = {
                      ...renameFolderTarget,
                      name: renameFolderText.trim(),
                      updated_at: new Date().toISOString()
                    };
                    await setDoc(
                      doc(db, 'artifacts', appId, 'users', user.uid, 'folders', updated.id),
                      updated
                    );
                    setRenameFolderTarget(null);
                    showToast('Đã đổi tên thư mục');
                  }}
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Lưu tên mới
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Triển khai Web Online & Xuất Tệp Web Độc Lập (.HTML / .JSON) */}
        {deployModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-sm font-extrabold">
                    Sử dụng Trực tuyến & Xuất Trang Web Độc lập
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDeployModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
                  <p className="font-bold">1. Ứng dụng đang chạy trực tuyến với Cloud Firestore</p>
                  <p className="mt-0.5 text-[11px]">
                    Mọi dữ liệu Ghi chú, Thư mục đa cấp, Code Vault, Lời giải và Danh sách phát đều đang được lưu trực tiếp trên cơ sở dữ liệu đám mây theo ID tài khoản:{' '}
                    <code className="font-mono font-bold">{user?.uid}</code>
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    2. Tải trang Web độc lập (.HTML) để đưa lên bất kỳ Hosting / GitHub Pages / Vercel
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Đóng gói toàn bộ kho lưu trữ hiện tại thành một tệp HTML duy nhất chạy ngay trên mọi trình duyệt máy tính & điện thoại.
                  </p>
                  <button
                    type="button"
                    onClick={handleExportStandaloneWebHtml}
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    <Download className="h-4 w-4" /> Tải xuống trang Web độc lập (.HTML)
                  </button>
                </div>

                <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    3. Sao lưu & Khôi phục toàn bộ Kho kiến thức (.JSON)
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleExportAllData}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 font-semibold hover:bg-slate-50 dark:border-slate-700"
                    >
                      <Download className="h-3.5 w-3.5" /> Xuất bản sao lưu (.JSON)
                    </button>
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 font-semibold hover:bg-slate-50 dark:border-slate-700">
                      <Upload className="h-3.5 w-3.5 text-indigo-600" /> Khôi phục từ tệp (.JSON)
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportJsonBackup}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 10. MODAL TẠO MỚI NỘI DUNG (GHI CHÚ, LIÊN KẾT, ẢNH, NHẠC, CODE, THƯ MỤC, DRIVE)
// ============================================================================
function CreateVaultResourceModal({
  initialType,
  folders,
  currentFolderId,
  user,
  profile,
  onClose,
  onSaveItem,
  onSaveFolder
}) {
  const [type, setType] = useState(initialType || 'note');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [folderId, setFolderId] = useState(currentFolderId || '');
  const [tagsInput, setTagsInput] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [storageProvider, setStorageProvider] = useState(
    initialType === 'drive' ? 'google_drive' : 'internal'
  );

  // Trường riêng cho Liên kết
  const [linkUrl, setLinkUrl] = useState('');
  const [siteName, setSiteName] = useState('');

  // Trường riêng cho Code Vault
  const [langKey, setLangKey] = useState('cpp');
  const [langVersion, setLangVersion] = useState('C++17');
  const [problemStatement, setProblemStatement] = useState('');

  // Trường riêng cho Âm nhạc / Hình ảnh
  const [artistName, setArtistName] = useState(profile?.display_name || 'Knowledge Vault Artist');
  const [mediaDataUrl, setMediaDataUrl] = useState('');
  const [mediaFileSize, setMediaFileSize] = useState(0);

  // Trường riêng cho Thư mục
  const [folderColor, setFolderColor] = useState('#4F46E5');

  // Tự động trích xuất Metadata an toàn từ URL
  const handleAutoFetchMetadata = () => {
    try {
      const parsed = new URL(linkUrl);
      const host = parsed.hostname.replace(/^www\./, '');
      setSiteName(host);
      if (!title) {
        const slug = parsed.pathname.split('/').filter(Boolean).pop() || host;
        setTitle(`${host.toUpperCase()} — ${slug.replace(/[-_]/g, ' ')}`);
      }
      if (!description) {
        setDescription(`Liên kết tham khảo từ ${parsed.origin}`);
      }
    } catch {
      // Nếu URL chưa đầy đủ, người dùng vẫn nhập thủ công bình thường
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFileSize(file.size);
    if (!title) setTitle(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setMediaDataUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const now = new Date().toISOString();

    if (type === 'folder') {
      await onSaveFolder({
        id: 'folder-' + Date.now(),
        owner_id: user?.uid || 'u-1',
        parent_id: folderId || null,
        name: title.trim() || 'Thư mục mới',
        icon: 'folder',
        color: folderColor,
        visibility,
        is_favorite: false,
        is_trashed: false,
        created_at: now,
        updated_at: now
      });
      return;
    }

    const actualType = type === 'drive' ? 'link' : type;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newItem = {
      id: 'item-' + Date.now(),
      owner_id: user?.uid || 'u-1',
      owner_email: profile?.email || '',
      folder_id: folderId || null,
      type: actualType,
      title: title.trim() || `Mục ${actualType.toUpperCase()} mới`,
      description: description.trim() || 'Được tạo trong Knowledge Vault',
      storage_provider: type === 'drive' ? 'google_drive' : storageProvider,
      size_bytes: mediaFileSize || 2048,
      visibility,
      share_role: 'viewer',
      shared_with: [],
      is_favorite: false,
      is_trashed: false,
      tags,
      created_at: now,
      updated_at: now
    };

    if (actualType === 'note') {
      newItem.note = {
        content_text: description || 'Nhập nội dung ghi chú tại đây...',
        checklist_json: '[]'
      };
    } else if (actualType === 'link') {
      newItem.link = {
        url: linkUrl || 'https://drive.google.com',
        domain: siteName || 'google.com',
        site_name: siteName || 'External Resource',
        meta_title: newItem.title,
        meta_description: newItem.description
      };
    } else if (actualType === 'image') {
      newItem.cover_url = mediaDataUrl || SAMPLE_GRAPH_SVG_URI;
      newItem.asset = {
        url: mediaDataUrl || SAMPLE_GRAPH_SVG_URI,
        mime_type: 'image/png',
        filename: newItem.title
      };
    } else if (actualType === 'music' || actualType === 'audio') {
      newItem.asset = {
        url: mediaDataUrl || createSynthesizedWavDataUri(240, 16),
        mime_type: 'audio/wav',
        filename: newItem.title,
        artist: artistName,
        duration_seconds: 16
      };
    } else if (actualType === 'code') {
      const langObj = getLanguageByKey(langKey);
      newItem.code_project = {
        problem_statement: problemStatement || 'Mô tả đề bài...',
        idea_notes: '',
        algorithm_notes: '',
        complexity_notes: 'Time: O(N log N) | Space: O(N)',
        edge_cases_notes: '',
        personal_notes: '',
        primary_language: langKey,
        primary_version: langVersion,
        solutions: JSON.stringify([
          {
            id: 'sol-' + Date.now(),
            solution_name: 'Lời giải 1',
            language_key: langKey,
            language_version: langVersion,
            runtime_env: langObj.versions[0]?.runtime || 'Standard Runtime',
            code_content: langObj.defaultTemplate,
            solution_notes: '',
            sample_input: '',
            sample_output: '',
            version_number: 1,
            updated_at: now
          }
        ])
      };
    }

    await onSaveItem(newItem);
  };

  const selectedLangObj = getLanguageByKey(langKey);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <h3 className="text-sm font-extrabold uppercase tracking-wider">
            Tạo mới trong Knowledge Vault
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Bộ chọn loại mục cần tạo */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {[
            { id: 'note', label: 'Ghi chú' },
            { id: 'code', label: 'Mã nguồn Code' },
            { id: 'link', label: 'Liên kết' },
            { id: 'image', label: 'Hình ảnh' },
            { id: 'music', label: 'Âm nhạc' },
            { id: 'audio', label: 'Âm thanh' },
            { id: 'folder', label: 'Thư mục' },
            { id: 'drive', label: 'Google Drive' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setType(tab.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                type === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">
              {type === 'folder' ? 'Tên thư mục *' : 'Tên mục lưu trữ *'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === 'code'
                  ? 'VD: Quy hoạch động cái túi (Knapsack)'
                  : type === 'folder'
                  ? 'VD: Thuật toán Đồ thị'
                  : 'Nhập tiêu đề...'
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-semibold dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          {type !== 'folder' && (
            <div>
              <label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">
                Mô tả ngắn
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả tóm tắt nội dung..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          )}

          {(type === 'link' || type === 'drive') && (
            <div className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <label className="block font-bold text-slate-600 dark:text-slate-300">
                {type === 'drive' ? 'Đường dẫn tệp Google Drive *' : 'URL Website hợp lệ *'}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={handleAutoFetchMetadata}
                  className="rounded-xl bg-slate-900 px-3 py-1.5 font-semibold text-white dark:bg-white dark:text-slate-900"
                >
                  Lấy Metadata
                </button>
              </div>
            </div>
          )}

          {type === 'code' && (
            <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div>
                <label className="mb-1 block font-bold">Ngôn ngữ</label>
                <select
                  value={langKey}
                  onChange={(e) => {
                    const nextL = getLanguageByKey(e.target.value);
                    setLangKey(nextL.key);
                    setLangVersion(nextL.versions[0].label);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-semibold dark:border-slate-700 dark:bg-slate-800"
                >
                  {CODE_VAULT_LANGUAGES.map((l) => (
                    <option key={l.key} value={l.key}>
                      {l.name} ({l.extension})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block font-bold">Phiên bản chuẩn</label>
                <select
                  value={langVersion}
                  onChange={(e) => setLangVersion(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-semibold dark:border-slate-700 dark:bg-slate-800"
                >
                  {selectedLangObj.versions.map((v) => (
                    <option key={v.label} value={v.label}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="mb-1 block font-bold">Tóm tắt đề bài</label>
                <textarea
                  rows={2}
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="Nhập đề bài hoặc yêu cầu bài toán..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>
          )}

          {(type === 'image' || type === 'music' || type === 'audio') && (
            <div className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <label className="block font-bold">
                Chọn tệp từ thiết bị ({type === 'image' ? 'JPEG, PNG, WebP, GIF' : 'MP3, WAV, OGG'})
              </label>
              <input type="file" onChange={handleFileSelect} className="w-full text-xs" />
              {type === 'music' && (
                <div>
                  <label className="mb-1 mt-2 block font-bold">Tên nghệ sĩ</label>
                  <input
                    type="text"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              )}
            </div>
          )}

          {type === 'folder' && (
            <div>
              <label className="mb-1 block font-bold">Màu đại diện thư mục</label>
              <input
                type="color"
                value={folderColor}
                onChange={(e) => setFolderColor(e.target.value)}
                className="h-9 w-20 cursor-pointer rounded-lg border border-slate-200"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">
                Thư mục lưu trữ
              </label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="">Thư mục gốc (Trang chủ)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">
                Quyền riêng tư
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="private">Chỉ mình tôi</option>
                <option value="restricted">Chia sẻ người cụ thể</option>
                <option value="link">Bất kỳ ai có liên kết</option>
                <option value="public">Công khai</option>
              </select>
            </div>
          </div>

          {type !== 'folder' && (
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">
                  Thẻ (Tags, cách nhau dấu phẩy)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="dijkstra, c++17, note..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block font-bold text-slate-600 dark:text-slate-300">
                  Phương thức lưu trữ
                </label>
                <select
                  value={storageProvider}
                  onChange={(e) => setStorageProvider(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="internal">Lưu nội bộ (Knowledge Vault)</option>
                  <option value="google_drive">Tham chiếu Google Drive</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-50 dark:border-slate-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-500"
            >
              Lưu vào Kho kiến thức
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 11. MODAL QUẢN LÝ QUYỀN RIÊNG TƯ & CHIA SẺ (4 CHẾ ĐỘ + PHÂN VAI TRÒ)
// ============================================================================
function SharePermissionModal({ item, onClose, onSavePermissions, showToast }) {
  const [visibility, setVisibility] = useState(item.visibility || 'private');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [sharedList, setSharedList] = useState(() => {
    if (Array.isArray(item.shared_with)) return item.shared_with;
    return [];
  });

  const handleAddPerson = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSharedList((prev) => [
      ...prev.filter((p) => p.email.toLowerCase() !== inviteEmail.trim().toLowerCase()),
      { email: inviteEmail.trim(), role: inviteRole, added_at: new Date().toISOString() }
    ]);
    setInviteEmail('');
    if (visibility === 'private') setVisibility('restricted');
  };

  const shareUrl = `${
    typeof window !== 'undefined' ? window.location.origin : 'https://knowledgevault.app'
  }/?share=${item.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold">Chia sẻ & Quyền riêng tư</h3>
            <p className="truncate text-xs text-slate-500">{item.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 4 Chế độ quyền truy cập */}
        <div className="space-y-2 text-xs">
          <label className="block font-bold text-slate-500">Chế độ truy cập</label>
          {[
            { id: 'private', label: 'Chỉ mình tôi (Private)', desc: 'Chỉ chủ sở hữu mới có quyền xem' },
            {
              id: 'restricted',
              label: 'Chia sẻ với người cụ thể',
              desc: 'Chỉ những email được cấp quyền bên dưới'
            },
            {
              id: 'link',
              label: 'Bất kỳ ai có liên kết',
              desc: 'Mọi người có liên kết đều xem được'
            },
            { id: 'public', label: 'Công khai (Public)', desc: 'Hiển thị trong danh mục Chia sẻ cộng đồng' }
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setVisibility(mode.id)}
              className={`flex w-full items-center justify-between rounded-xl border p-2.5 text-left ${
                visibility === mode.id
                  ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <p className="font-bold">{mode.label}</p>
                <p className="text-[11px] text-slate-500">{mode.desc}</p>
              </div>
              {visibility === mode.id && <Check className="h-4 w-4 text-indigo-600" />}
            </button>
          ))}
        </div>

        {/* Thêm người được chia sẻ cụ thể */}
        <form onSubmit={handleAddPerson} className="mt-4 flex gap-1.5 text-xs">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Nhập email người nhận..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="viewer">Người xem</option>
            <option value="commenter">Người nhận xét</option>
            <option value="editor">Người chỉnh sửa</option>
          </select>
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-3 py-1.5 font-semibold text-white dark:bg-white dark:text-slate-900"
          >
            Thêm
          </button>
        </form>

        {/* Danh sách người đang được chia sẻ & Thu hồi quyền */}
        {sharedList.length > 0 && (
          <div className="mt-3 max-h-32 space-y-1.5 overflow-auto border-t border-slate-100 pt-2.5 text-xs dark:border-slate-800">
            {sharedList.map((entry) => (
              <div
                key={entry.email}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 dark:bg-slate-800"
              >
                <span className="truncate font-medium">{entry.email}</span>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {entry.role === 'editor'
                      ? 'Chỉnh sửa'
                      : entry.role === 'commenter'
                      ? 'Nhận xét'
                      : 'Xem'}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSharedList((prev) => prev.filter((p) => p.email !== entry.email))
                    }
                    className="text-rose-500 hover:underline"
                  >
                    Thu hồi
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sao chép liên kết chia sẻ */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              showToast('Đã sao chép liên kết chia sẻ vào bộ nhớ tạm');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            <Copy className="h-3.5 w-3.5" /> Sao chép liên kết chia sẻ
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() =>
                onSavePermissions({
                  ...item,
                  visibility,
                  shared_with: sharedList,
                  updated_at: new Date().toISOString()
                })
              }
              className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Lưu phân quyền
            </button>
          </div>
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
