import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n';

if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) return child;
    return originalRemoveChild.apply(this, [child]) as T;
  };
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) return newNode;
    return originalInsertBefore.apply(this, [newNode, ref]) as T;
  };
}

createRoot(document.getElementById('root')!).render(<App />);
