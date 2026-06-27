"use client";

interface GridCell {
  row: number;
  col: number;
  lat: number;
  lng: number;
  rank: number | null;
}

interface LocalSeoGridProps {
  grid: GridCell[];
  gridSize?: number;
  businessName?: string;
  onCellClick?: (row: number, col: number) => void;
  editable?: boolean;
}

function getRankColor(rank: number | null): { bg: string; text: string } {
  if (rank === null || rank === 0) return { bg: "#6b7280", text: "#ffffff" };
  if (rank === 1) return { bg: "#15803d", text: "#ffffff" };
  if (rank <= 3) return { bg: "#22c55e", text: "#ffffff" };
  if (rank <= 5) return { bg: "#f59e0b", text: "#ffffff" };
  if (rank <= 10) return { bg: "#f97316", text: "#ffffff" };
  if (rank <= 20) return { bg: "#dc2626", text: "#ffffff" };
  return { bg: "#dc2626", text: "#ffffff" };
}

function getRankLabel(rank: number | null): string {
  if (rank === null || rank === 0) return "NF";
  if (rank >= 21) return "21+";
  return String(rank);
}

export default function LocalSeoGrid({ grid, gridSize = 7, businessName, onCellClick, editable }: LocalSeoGridProps) {
  const cells: GridCell[][] = [];
  for (let r = 0; r < gridSize; r++) {
    cells[r] = [];
    for (let c = 0; c < gridSize; c++) {
      cells[r][c] = grid.find((g) => g.row === r && g.col === c) || { row: r, col: c, lat: 0, lng: 0, rank: null };
    }
  }

  const center = Math.floor(gridSize / 2);

  return (
    <div className="bg-white rounded-xl border border-[#c3cdd8]/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Local SEO Grid</h3>
          {businessName && <p className="text-[12px] text-on-surface-variant mt-0.5">Rankings for &ldquo;{businessName}&rdquo;</p>}
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#15803d]" /> 1-3</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#f59e0b]" /> 4-5</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#f97316]" /> 6-10</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#dc2626]" /> 11+</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#6b7280]" /> NF</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(40px, 1fr))` }}
        >
          {cells.flat().map((cell, i) => {
            const { bg, text } = getRankColor(cell.rank);
            const isCenter = cell.row === center && cell.col === center;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onCellClick?.(cell.row, cell.col)}
                disabled={!editable}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  editable ? "cursor-pointer hover:scale-110 hover:shadow-md" : "cursor-default"
                } ${isCenter ? "ring-2 ring-offset-1 ring-[#004527]" : ""}`}
                style={{ backgroundColor: bg, color: text }}
                title={`Row ${cell.row}, Col ${cell.col}: ${getRankLabel(cell.rank)}`}
              >
                {getRankLabel(cell.rank)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[11px] text-on-surface-variant">
        <span className="material-symbols-outlined text-[14px]">info</span>
        {editable ? "Click any cell to set the ranking position" : "Grid shows Google Maps ranking positions at different locations around the business"}
      </div>
    </div>
  );
}
