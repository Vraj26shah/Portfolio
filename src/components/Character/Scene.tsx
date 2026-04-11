import { Suspense, lazy, useEffect } from "react";
import { useLoading } from "../../context/LoadingProvider";
import { setProgress } from "../Loading";

const Spline = lazy(() => import("@splinetool/react-spline"));

const Scene = () => {
  const { setLoading } = useLoading();

  useEffect(() => {
    const progress = setProgress((value) => setLoading(value));
    // Simulate load completion after Spline starts loading
    const timer = setTimeout(() => {
      progress.loaded().then(() => {
        const light = document.querySelector(".character-rim");
        if (light) {
          light.parentElement?.classList.add("character-loaded");
        }
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="character-container">
      <div className="character-model">
        <div className="character-rim"></div>
        <Suspense
          fallback={
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className="loader"></span>
            </div>
          }
        >
          <Spline
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default Scene;
