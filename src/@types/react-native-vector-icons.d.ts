declare module "react-native-vector-icons/Ionicons" {
  import { IconProps } from "react-native-vector-icons/Icon";
  import React from "react";
  import { TextStyle, ViewStyle } from "react-native";

  export interface IoniconsProps extends IconProps {
    style?: TextStyle | ViewStyle;
  }

  export default class Ionicons extends React.Component<IoniconsProps> {}
}
