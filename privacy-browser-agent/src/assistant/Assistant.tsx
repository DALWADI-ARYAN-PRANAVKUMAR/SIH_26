/**
 * Assistant — Top-level component that renders the avatar and chat panel.
 *
 * This is the React root mounted inside the shadow DOM.
 */

import React from "react";
import { Avatar } from "./Avatar";

export const Assistant: React.FC = () => {
  return (
    <>
      <Avatar />
    </>
  );
};
