import { describe, it, expect } from "vitest";

import { mount } from "@vue/test-utils";
import FilesDropTarget from "../FilesDropTarget.vue";

describe("FilesDropTarget", () => {
    it("renders properly", () => {
        const wrapper = mount(FilesDropTarget, { props: { supportDesktop: true } });
        expect(wrapper.text()).toContain("Hello Vitest");
    });
});
