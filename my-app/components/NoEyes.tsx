import { Svg, type SvgProps, Rect, Defs, Pattern, Use, Image } from "react-native-svg";

function NoEyesIcon(props: SvgProps) {
  return (
    <Svg {...props} width="21" height="21" viewBox="0 0 21 21" fill="none">
        <Rect width="21" height="21" fill="url(#pattern0_54_321)"/>
        <Defs>
            <Pattern id="pattern0_54_321" patternContentUnits="objectBoundingBox" width="1" height="1">
            <Use xlinkHref="#image0_54_321" transform="scale(0.0078125)"/>
            </Pattern>
            <Image id="image0_54_321" width="128" height="128" xlinkHref="data:image/png;base64,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"/>
        </Defs>
    </Svg>


  );
}

export default NoEyesIcon;