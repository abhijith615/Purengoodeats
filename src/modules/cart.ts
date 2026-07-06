/**
 * Cart: quantity steppers, add-to-cart with a honey-drop fly animation,
 * a slide-in drawer, and localStorage persistence.
 */
import { gsap } from 'gsap';

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

const STORAGE_KEY = 'png-cart-v1';
const inr = (n: number): string => `₹${n.toLocaleString('en-IN')}`;

let cart: CartItem[] = [];
let lastFocused: HTMLElement | null = null;

export function initCart(): void {
  cart = load();
  bindProductCards();
  bindDrawer();
  renderCart();
}

/* ------------------------------------------------------------- storage */
function load(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as CartItem[];
  } catch {
    return [];
  }
}
function save(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

/* ------------------------------------------------------- product cards */
function bindProductCards(): void {
  document.querySelectorAll<HTMLElement>('[data-product-id]').forEach((card) => {
    const value = card.querySelector<HTMLElement>('[data-qty-value]');
    let qty = 1;

    card.querySelectorAll<HTMLButtonElement>('[data-qty]').forEach((btn) => {
      btn.addEventListener('click', () => {
        qty = Math.min(9, Math.max(1, qty + Number(btn.dataset.qty)));
        if (value) {
          value.textContent = String(qty);
          gsap.fromTo(value, { scale: 1.35 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
        }
      });
    });

    card.querySelector<HTMLButtonElement>('[data-add-to-cart]')?.addEventListener('click', (e) => {
      addItem({
        id: card.dataset.productId!,
        name: card.dataset.name!,
        price: Number(card.dataset.price),
        qty,
      });
      flyToCart(e.currentTarget as HTMLElement);
    });
  });
}

function addItem(item: CartItem): void {
  const existing = cart.find((i) => i.id === item.id);
  if (existing) existing.qty = Math.min(99, existing.qty + item.qty);
  else cart.push({ ...item });
  save();
  renderCart();
}

/** A golden drop detaches from the button and lands in the cart icon. */
function flyToCart(from: HTMLElement): void {
  const cartBtn = document.getElementById('cart-toggle');
  if (!cartBtn) return;

  const a = from.getBoundingClientRect();
  const b = cartBtn.getBoundingClientRect();

  const drop = document.createElement('span');
  drop.setAttribute('aria-hidden', 'true');
  drop.style.cssText = `position:fixed;z-index:130;left:${a.left + a.width / 2}px;top:${a.top}px;width:14px;height:14px;border-radius:60% 40% 55% 45%/50% 55% 45% 60%;background:#E8A020;pointer-events:none;`;
  document.body.append(drop);

  gsap.to(drop, {
    duration: 0.8,
    ease: 'power2.inOut',
    keyframes: [
      { x: (b.left - a.left) * 0.5, y: -80, scale: 1.2, duration: 0.4 },
      { x: b.left + b.width / 2 - (a.left + a.width / 2), y: b.top - a.top, scale: 0.4, duration: 0.4 },
    ],
    onComplete: () => {
      drop.remove();
      const count = document.getElementById('cart-count');
      if (count) gsap.fromTo(count, { scale: 1.6 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
    },
  });
}

/* --------------------------------------------------------------- drawer */
function bindDrawer(): void {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  const openBtn = document.getElementById('cart-toggle');
  const closeBtn = document.getElementById('cart-close');
  if (!drawer || !overlay || !openBtn || !closeBtn) return;

  const open = (): void => {
    lastFocused = document.activeElement as HTMLElement;
    overlay.classList.remove('hidden');
    drawer.setAttribute('aria-hidden', 'false');
    gsap.to(overlay, { autoAlpha: 1, duration: 0.4 });
    gsap.to(drawer, { xPercent: -100, duration: 0.6, ease: 'power4.out' });
    closeBtn.focus();
    document.addEventListener('keydown', onKeydown);
  };
  const close = (): void => {
    drawer.setAttribute('aria-hidden', 'true');
    gsap.to(overlay, {
      autoAlpha: 0,
      duration: 0.4,
      onComplete: () => overlay.classList.add('hidden'),
    });
    gsap.to(drawer, { xPercent: 0, duration: 0.5, ease: 'power3.in' });
    document.removeEventListener('keydown', onKeydown);
    lastFocused?.focus();
  };
  const onKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') close();
  };

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);

  document.getElementById('checkout-btn')?.addEventListener('click', () => {
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    if (total === 0) return;
    // Demo checkout: hand off to WhatsApp ordering.
    const lines = cart.map((i) => `${i.qty}× ${i.name}`).join(', ');
    window.open(
      `https://wa.me/919876543210?text=${encodeURIComponent(`Hi! I'd like to order: ${lines}. Total ${inr(total)}.`)}`,
      '_blank',
      'noopener'
    );
  });

  // Item-level controls (event delegation on the list).
  document.getElementById('cart-items')?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-cart-action]');
    if (!btn) return;
    const id = btn.dataset.id!;
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    switch (btn.dataset.cartAction) {
      case 'inc': item.qty = Math.min(99, item.qty + 1); break;
      case 'dec': item.qty -= 1; break;
      case 'remove': item.qty = 0; break;
    }
    cart = cart.filter((i) => i.qty > 0);
    save();
    renderCart();
  });
}

/* --------------------------------------------------------------- render */
function renderCart(): void {
  const list = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const countEl = document.getElementById('cart-count');
  if (!list || !totalEl || !countEl) return;

  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  countEl.textContent = String(count);
  gsap.to(countEl, { scale: count > 0 ? 1 : 0, duration: 0.3, ease: 'back.out(2)' });
  totalEl.textContent = inr(total);

  if (cart.length === 0) {
    list.innerHTML = `<p id="cart-empty" class="mt-10 text-center font-sans text-sm text-cocoa/50">Your cart is empty — the bees are waiting.</p>`;
    return;
  }

  list.innerHTML = cart
    .map(
      (i) => `
      <div class="cart-item" data-id="${i.id}">
        <span class="cart-item__thumb" aria-hidden="true">${i.name.match(/\d+g/)?.[0] ?? '🍯'}</span>
        <div>
          <p class="font-serif">${i.name}</p>
          <div class="mt-1 flex items-center gap-2 font-sans text-sm text-cocoa/60">
            <button data-cart-action="dec" data-id="${i.id}" class="h-6 w-6 rounded-full border border-cocoa/20 leading-none hover:bg-honey" aria-label="Decrease ${i.name} quantity">−</button>
            <span aria-live="polite">${i.qty}</span>
            <button data-cart-action="inc" data-id="${i.id}" class="h-6 w-6 rounded-full border border-cocoa/20 leading-none hover:bg-honey" aria-label="Increase ${i.name} quantity">+</button>
          </div>
        </div>
        <div class="text-right">
          <p class="font-sans">${inr(i.price * i.qty)}</p>
          <button data-cart-action="remove" data-id="${i.id}" class="mt-1 font-sans text-xs text-cocoa/40 underline hover:text-forest-honey" aria-label="Remove ${i.name} from cart">Remove</button>
        </div>
      </div>`
    )
    .join('');
}
