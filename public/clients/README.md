# Como Adicionar Logos Reais dos Clientes

## 📁 Estrutura de Arquivos

Coloque as logos dos clientes nesta pasta (`/public/clients/`) com os seguintes formatos aceitos:
- `.png` (recomendado - com fundo transparente)
- `.svg` (melhor qualidade)
- `.jpg` / `.webp`

## 📐 Especificações das Logos

### Tamanho Recomendado:
- **Largura:** 400px - 600px
- **Altura:** 200px - 300px
- **Formato:** PNG com fundo transparente
- **Peso:** Máximo 100KB (otimize para web)

### Qualidade:
- Use logos em alta resolução
- Fundo transparente (PNG)
- Cores originais da marca

## 🔧 Como Implementar

### Opção 1: Substituir os Placeholders

Edite o arquivo `/app/components/Clients.tsx` e substitua os dados dos clientes:

```tsx
const clients = [
  {
    name: "Farmácia Central",
    shortName: "Central",
    logo: "/clients/farmacia-central.png",  // Adicione o caminho da logo
    hasLogo: true  // Marque como true quando tiver logo real
  },
  // ... mais clientes
];
```

### Opção 2: Usar Image do Next.js

No componente, substitua o placeholder SVG por:

```tsx
{client.hasLogo ? (
  <Image
    src={client.logo}
    alt={client.name}
    width={160}
    height={80}
    className="object-contain"
  />
) : (
  // Código do placeholder atual
)}
```

## 🎨 Exemplo de Nomes de Arquivo

```
/public/clients/
  ├── drogaria-sp.png
  ├── raia-drogasil.png
  ├── pague-menos.png
  ├── pacheco.png
  ├── nissei.png
  ├── araujo.png
  ├── panvel.png
  └── farma-conde.png
```

## ⚙️ Ferramentas de Otimização

Antes de adicionar as logos, otimize-as:

1. **TinyPNG** - https://tinypng.com (reduz tamanho)
2. **Squoosh** - https://squoosh.app (otimiza imagens)
3. **Remove.bg** - https://remove.bg (remove fundo)

## 📝 Notas Importantes

- ✅ Use sempre logos oficiais com permissão
- ✅ Mantenha a proporção original da logo
- ✅ Prefira PNG transparente para melhor resultado
- ✅ O efeito grayscale funciona melhor com logos coloridas
- ⚠️ Respeite os direitos autorais das marcas
- ⚠️ Tenha autorização para uso das logos

## 🎯 Resultado Esperado

Com logos reais, a seção terá:
- ✨ Carrossel infinito suave
- 🎨 Efeito P&B → Colorido ao hover
- 🔍 Zoom sutil ao passar o mouse
- 💫 Glow effect na cor da marca
- 🔄 Scroll automático (pausa ao hover)

---

**Dúvidas?** Consulte a documentação do Next.js Image: https://nextjs.org/docs/app/api-reference/components/image
