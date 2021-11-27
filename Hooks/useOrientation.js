import { useState, useEffect } from "react";
import { Dimensions } from "react-native";

const useOrientation = () => {
    const [orientation, setOrientation] = useState("portrait");

    useEffect(() => {
        let isMounted = true;
        const ori = isPortrait() ? "portrait" : "landscape";
        setOrientation(ori);

        Dimensions.addEventListener("change", () => {
            const ori = isPortrait() ? "portrait" : "landscape";
            if (isMounted) setOrientation(ori);
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const isPortrait = () => {
        const dim = Dimensions.get("screen");
        return dim.height >= dim.width;
    };

    return orientation;
};

export default useOrientation;