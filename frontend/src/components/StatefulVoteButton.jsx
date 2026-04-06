import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* Spinner SVG */
function Loader() {
  return (
    <svg
      className="animate-spin w-5 h-5 flex-shrink-0 text-white"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  );
}

/* Check SVG */
function CheckIcon() {
  return (
    <svg
      className="w-5 h-5 flex-shrink-0 text-white"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M9 12l2 2l4 -4" />
    </svg>
  );
}

/**
 * StatefulVoteButton — diseño Aceternity pill button.
 * idle → loading (spinner) → success (check) → navega
 */
export function StatefulVoteButton({ href, colorFrom, colorTo }) {
  const navigate = useNavigate();
  const [state, setState] = useState('idle'); // 'idle' | 'loading' | 'success'

  const handleClick = async () => {
    if (state !== 'idle') return;
    setState('loading');
    await new Promise((r) => setTimeout(r, 900));
    setState('success');
    await new Promise((r) => setTimeout(r, 500));
    navigate(href);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mt-auto flex min-w-[120px] cursor-pointer items-center justify-center gap-2
                 rounded-full px-5 py-2.5 font-medium text-white text-sm
                 ring-offset-2 ring-offset-[#111827] transition duration-200
                 hover:ring-2 active:scale-95"
      style={{
        background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})`,
        '--tw-ring-color': colorFrom,
      }}
    >
      {state === 'loading' && <Loader />}
      {state === 'success' && <CheckIcon />}
      <span>
        {state === 'loading' ? 'Entrando...' : state === 'success' ? 'Listo!' : 'Votar ahora →'}
      </span>
    </button>
  );
}
