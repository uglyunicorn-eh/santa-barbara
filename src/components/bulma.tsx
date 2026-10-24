import React from "react";
import * as Bulma from "react-bulma-components";

// React 19 ignores `defaultProps` on function components, but react-bulma-components 4.1.0
// relies on them (e.g. `renderAs`), so inputs and buttons render as plain divs.
// Re-export the library with its default props applied explicitly.

const createElement = React.createElement;

// Library-internal elements are built with React.createElement; restore defaults there too.
(React as any).createElement = function (type: any, props: any, ...children: any[]) {
  return createElement.call(React, type, applyDefaults(type, props), ...children);
};

function applyDefaults(type: any, props: any) {
  if (typeof type !== "function" || !type.defaultProps) {
    return props;
  }
  const resolved = { ...props };
  for (const key of Object.keys(type.defaultProps)) {
    if (resolved[key] === undefined) {
      resolved[key] = type.defaultProps[key];
    }
  }
  return resolved;
}

const wrap = <T,>(component: T): T => {
  if (component && typeof component === "object") {
    return Object.fromEntries(Object.entries(component).map(([key, value]) => [key, wrapStatic(value)])) as T;
  }
  if (typeof component !== "function") {
    return component;
  }

  const Original = component as any;
  const Wrapped: any = (props: any) => <Original {...applyDefaults(Original, props)} />;
  Wrapped.displayName = Original.displayName ?? Original.name;

  for (const key of Object.keys(Original)) {
    if (key !== "defaultProps") {
      Wrapped[key] = wrapStatic(Original[key]);
    }
  }
  return Wrapped;
};

// Don't rely on function names here: they are minified in production builds.
const wrapStatic = (value: any) => (typeof value === "function" && (value.defaultProps || Object.keys(value).length) ? wrap(value) : value);

export const Button = wrap(Bulma.Button);
export const Card = wrap(Bulma.Card);
export const Columns = wrap(Bulma.Columns);
export const Container = wrap(Bulma.Container);
export const Content = wrap(Bulma.Content);
export const Footer = wrap(Bulma.Footer);
export const Form = wrap(Bulma.Form);
export const Hero = wrap(Bulma.Hero);
export const Image = wrap(Bulma.Image);
export const Message = wrap(Bulma.Message);
export const Modal = wrap(Bulma.Modal);
export const Section = wrap(Bulma.Section);
export const Tabs = wrap(Bulma.Tabs);
