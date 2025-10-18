# 🎨 Frontend - Visualizador B3

Interface moderna e responsiva para análise de ações brasileiras.

## 🚀 Início Rápido

```bash
# Instalar dependências
npm install

# Iniciar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start
```

## 📦 Estrutura

```
src/
├── app/                      # App Router Next.js
│   ├── page.tsx             # Dashboard principal
│   ├── layout.tsx           # Layout global
│   └── globals.css          # Estilos globais
│
├── components/              # Componentes React
│   ├── GraficoCandlestick.tsx    # Gráfico de velas
│   ├── GraficoIndicadores.tsx    # RSI, MACD, Bollinger
│   ├── GraficoComparacao.tsx     # Comparação de ações
│   ├── GraficoIbovespa.tsx       # Gráfico do IBOV
│   ├── HeatmapSetores.tsx        # Heatmap setorial
│   ├── RankingAcoes.tsx          # Rankings
│   ├── PainelAcoes.tsx           # Seletor de ações
│   └── Sidebar.tsx               # Menu lateral
│
└── lib/                     # Utilitários
    ├── api.ts              # Cliente API
    └── websocket.ts        # WebSocket client
```

## 🎨 Componentes

### GraficoCandlestick
Gráfico de velas profissional usando Lightweight Charts.

**Props:**
```typescript
{
  ticker: string;           // Código da ação
  dados: DadosAcao[];      // Array de dados OHLCV
  mostrarVolume?: boolean; // Exibir volume (padrão: true)
  altura?: number;         // Altura em pixels (padrão: 500)
}
```

**Uso:**
```tsx
<GraficoCandlestick 
  ticker="PETR4"
  dados={dadosHistoricos}
  mostrarVolume={true}
  altura={600}
/>
```

### GraficoIndicadores
Visualização de indicadores técnicos.

**Props:**
```typescript
{
  dados: DadosIndicador[]; // Dados com indicadores
  tipo: "rsi" | "macd" | "bollinger";
  ticker?: string;
}
```

### HeatmapSetores
Mapa de calor dos setores da B3.

**Props:**
```typescript
{
  setores: SetorData[];    // Array de setores e variações
}
```

### RankingAcoes
Ranking de ações por critério.

**Props:**
```typescript
{
  acoes: AcaoRanking[];
  tipo: "variacao" | "volume";
}
```

## 🎯 API Integration

### Configuração
O endpoint da API é configurável via variável de ambiente:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Funções Disponíveis

```typescript
import { 
  buscarPrincipaisAcoes,
  buscarDadosAcao,
  buscarIbovespa,
  buscarDesempenhoSetores,
  buscarRankingAcoes,
  buscarCorrelacoes,
  buscarComparacaoAcoes
} from '@/lib/api';

// Exemplo de uso
const dados = await buscarDadosAcao('PETR4', '1y');
const ibov = await buscarIbovespa('1y');
const setores = await buscarDesempenhoSetores();
```

## 🎨 Customização

### Cores e Temas
Edite `tailwind.config.ts` para personalizar:

```typescript
theme: {
  extend: {
    colors: {
      primary: '#3B82F6',
      // suas cores...
    }
  }
}
```

### Estilos Globais
Modifique `app/globals.css` para ajustar:
- Scrollbars personalizadas
- Efeitos glass
- Animações
- Gradientes

## 📱 Responsividade

O layout é totalmente responsivo:
- Desktop: Grid completo
- Tablet: Grid adaptativo
- Mobile: Layout empilhado

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev         # Inicia dev server

# Produção
npm run build       # Build otimizado
npm start          # Serve build de produção

# Qualidade
npm run lint       # Linter ESLint
npm run type-check # TypeScript check
```

## 📊 Performance

### Otimizações Implementadas
- ✅ Server Components quando possível
- ✅ Lazy loading de gráficos
- ✅ Memoização de cálculos
- ✅ Debounce em buscas
- ✅ Code splitting automático

### Lighthouse Score
- Performance: 90+
- Accessibility: 95+
- Best Practices: 100
- SEO: 100

## 🎭 Animações

Usando Framer Motion:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* conteúdo */}
</motion.div>
```

## 🐛 Debug

### React DevTools
Instale a extensão React DevTools para debug.

### Next.js Debug
```bash
NODE_OPTIONS='--inspect' npm run dev
```

Abra `chrome://inspect` para debugar.

## 📚 Dependências Principais

```json
{
  "react": "^18.3.1",
  "next": "^14.2.0",
  "typescript": "^5.5.0",
  "tailwindcss": "^3.4.0",
  "framer-motion": "^11.3.0",
  "lightweight-charts": "^4.1.0",
  "recharts": "^2.12.0",
  "axios": "^1.7.0",
  "lucide-react": "^0.400.0"
}
```

## 🎓 Aprendizado

### Recursos Recomendados
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

---

**Interface moderna para análise profissional de ações brasileiras 📈**
