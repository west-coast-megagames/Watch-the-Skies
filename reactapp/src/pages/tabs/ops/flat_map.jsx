import React from "react";
import World from "@svg-maps/world";
import { CheckboxSVGMap } from "react-svg-map";
 
class Map extends React.Component {
  constructor(props) {
    super(props);
  }
 
  render() {
    return <CheckboxSVGMap
      map={World}
    />;
  }
}
 
export default Map;