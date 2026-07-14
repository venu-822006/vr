export default function SkeletonCard() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>
      <div style={skeletonStyles.card}>
        <div style={{ ...skeletonStyles.shimmer, ...skeletonStyles.image }} />
        <div style={{ ...skeletonStyles.shimmer, ...skeletonStyles.titleLine }} />
        <div style={{ ...skeletonStyles.shimmer, ...skeletonStyles.subtitleLine }} />
        <div style={{ ...skeletonStyles.shimmer, ...skeletonStyles.priceLine }} />
        <div style={{ ...skeletonStyles.shimmer, ...skeletonStyles.button }} />
      </div>
    </>
  );
}

const shimmerBg = {
  backgroundImage: "linear-gradient(90deg, #e8e8e8 0%, #f5f5f5 40%, #e8e8e8 80%)",
  backgroundSize: "800px 100%",
  backgroundRepeat: "no-repeat",
  animation: "shimmer 1.5s ease-in-out infinite",
};

const skeletonStyles = {
  card: {
    background: "var(--paper)",
    border: "1px solid var(--sage-line)",
    borderRadius: 14,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  shimmer: {
    ...shimmerBg,
    borderRadius: 8,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  titleLine: {
    width: "75%",
    height: 14,
    borderRadius: 6,
  },
  subtitleLine: {
    width: "55%",
    height: 12,
    borderRadius: 6,
  },
  priceLine: {
    width: "40%",
    height: 22,
    borderRadius: 4,
  },
  button: {
    width: "100%",
    height: 34,
    borderRadius: 10,
    marginTop: 4,
  },
};
