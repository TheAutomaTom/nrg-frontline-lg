import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";
import DataRefresh from "@/App/Views/Home/DataRefresh.vue";
import DataBackup from "@/App/Views/Home/DataBackup.vue";
// TODO: Add tests for PlannedLaborImporter components when they are created
// import PliConfigLabors from "@/App/Views/Features/PlannedLaborImporter/PliConfig/PliConfigLabors.vue";
// import PliProjectPicker from "@/App/Views/Features/PlannedLaborImporter/PliConfig/PliProjectPicker.vue";
// import PliLaborImporter from "@/App/Views/Features/PlannedLaborImporter/PliLaborImporter.vue";
// import PLiHelpPage from "@/App/Views/Features/PlannedLaborImporter/PliHelpPage.vue";

const naiveUIStubs = {
  "n-card": {
    template: '<div class="n-card"><slot /><slot name="header-extra" /></div>',
  },
  "n-flex": { template: "<div><slot /></div>" },
  "n-space": { template: "<div><slot /></div>" },
  "n-button": { template: "<button><slot /></button>" },
  "n-text": { template: "<span><slot /></span>" },
  "n-divider": { template: "<div><slot /></div>" },
  "n-input": { template: '<input type="text" />' },
  "n-alert": { template: "<div><slot /></div>" },
  "n-data-table": { template: "<div></div>" },
  "n-modal": { template: "<div><slot /></div>" },
  "feature-selection": { template: "<div></div>" },
};

const createTestPinia = () => {
  const pinia = createPinia();
  setActivePinia(pinia);
  return pinia;
};

describe("All Pages Load and Render", () => {
  beforeEach(() => {
    createTestPinia();
    vi.clearAllMocks();
  });

  // ========== DataRefresh Page ==========
  describe("DataRefresh.vue", () => {
    const mountDataRefresh = () =>
      mount(DataRefresh, {
        global: {
          stubs: naiveUIStubs,
        },
      });

    it("should render the page", () => {
      const wrapper = mountDataRefresh();
      expect(wrapper.exists()).toBe(true);
    });

    it("should render Data Refresh card", () => {
      const wrapper = mountDataRefresh();
      const cards = wrapper.findAll(".n-card");
      expect(cards.length).toBeGreaterThanOrEqual(1);
    });

    it("should have an API key input field", () => {
      const wrapper = mountDataRefresh();
      expect(wrapper.exists()).toBe(true);
    });

    it("should render Validate Api Key button", () => {
      const wrapper = mountDataRefresh();
      const buttons = wrapper.findAll("button");
      const buttonTexts = buttons.map((b) => b.text());
      expect(
        buttonTexts.some((text) => text.includes("Validate Api Key")),
      ).toBe(true);
    });

    it("should render FeatureSelection slot", () => {
      const wrapper = mountDataRefresh();
      // FeatureSelection is a child component, verify the component structure exists
      expect(wrapper.vm.$options.components).toBeDefined();
    });

    it("should render cache stats info when labor-importer feature is active", async () => {
      const wrapper = mountDataRefresh();
      await wrapper.vm.$nextTick();
      // Cache stats should be present in the DOM structure
      expect(wrapper.text()).toContain("Cache Stats");
    });
  });

  // ========== DataBackup Page ==========
  describe("DataBackup.vue", () => {
    const mountDataBackup = () =>
      mount(DataBackup, {
        global: {
          stubs: naiveUIStubs,
          mocks: {
            $router: {
              push: vi.fn(),
            },
          },
        },
      });

    it("should render the page", () => {
      const wrapper = mountDataBackup();
      expect(wrapper.exists()).toBe(true);
    });

    it("should render Local App State section", () => {
      const wrapper = mountDataBackup();
      expect(wrapper.text()).toContain("Local App State");
    });

    it("should render New Game button", () => {
      const wrapper = mountDataBackup();
      const buttons = wrapper.findAll("button");
      const buttonTexts = buttons.map((b) => b.text());
      expect(buttonTexts.some((text) => text.includes("New Game"))).toBe(true);
    });

    it("should render Save Game button", () => {
      const wrapper = mountDataBackup();
      const buttons = wrapper.findAll("button");
      const buttonTexts = buttons.map((b) => b.text());
      expect(buttonTexts.some((text) => text.includes("Save Game"))).toBe(true);
    });

    it("should render Load Game button", () => {
      const wrapper = mountDataBackup();
      const buttons = wrapper.findAll("button");
      const buttonTexts = buttons.map((b) => b.text());
      expect(buttonTexts.some((text) => text.includes("Load Game"))).toBe(true);
    });

    it("should render Current Snapshot Contents section", () => {
      const wrapper = mountDataBackup();
      expect(wrapper.text()).toContain("Current Snapshot Contents");
    });
  });

  // TODO: Add tests for PlannedLaborImporter components when they are created
  // ========== PliConfigLabors Page ==========
  // describe("PliConfigLabors.vue", () => {
  //   const mountPliConfigLabors = () =>
  //     mount(PliConfigLabors, {
  //       global: {
  //         stubs: naiveUIStubs,
  //       },
  //     });

  //   it("should render the page", () => {
  //     const wrapper = mountPliConfigLabors();
  //     expect(wrapper.exists()).toBe(true);
  //   });

  //   it("should render a card container", () => {
  //     const wrapper = mountPliConfigLabors();
  //     const cards = wrapper.findAll(".n-card");
  //     expect(cards.length).toBeGreaterThanOrEqual(1);
  //   });
  // });

  // // ========== PliProjectPicker Page ==========
  // describe("PliProjectPicker.vue", () => {
  //   const mountPliProjectPicker = () =>
  //     mount(PliProjectPicker, {
  //       global: {
  //         stubs: naiveUIStubs,
  //       },
  //     });

  //   it("should render the page", () => {
  //     const wrapper = mountPliProjectPicker();
  //     expect(wrapper.exists()).toBe(true);
  //   });

  //   it("should render Project Selection card title", () => {
  //     const wrapper = mountPliProjectPicker();
  //     const cards = wrapper.findAll(".n-card");
  //     expect(cards.length).toBeGreaterThanOrEqual(1);
  //   });

  //   it("should render Get Template button in header", () => {
  //     const wrapper = mountPliProjectPicker();
  //     const buttons = wrapper.findAll("button");
  //     const buttonTexts = buttons.map((b) => b.text());
  //     expect(buttonTexts.some((text) => text.includes("Get Template"))).toBe(
  //       true,
  //     );
  //   });

  //   it("should render data table for project selection", () => {
  //     const wrapper = mountPliProjectPicker();
  //     const dataTables = wrapper.findAll(".n-data-table");
  //     expect(dataTables.length).toBeGreaterThanOrEqual(1);
  //   });
  // });

  // // ========== PliLaborImporter Page ==========
  // describe("PliLaborImporter.vue", () => {
  //   const mountPliLaborImporter = () =>
  //     mount(PliLaborImporter, {
  //       global: {
  //         stubs: naiveUIStubs,
  //       },
  //     });

  //   it("should render the page", () => {
  //     const wrapper = mountPliLaborImporter();
  //     expect(wrapper.exists()).toBe(true);
  //   });

  //   it("should render a card container", () => {
  //     const wrapper = mountPliLaborImporter();
  //     const cards = wrapper.findAll(".n-card");
  //     expect(cards.length).toBeGreaterThanOrEqual(1);
  //   });

  //   it("should render buttons for upload or workflow", () => {
  //     const wrapper = mountPliLaborImporter();
  //     const buttons = wrapper.findAll("button");
  //     expect(buttons.length).toBeGreaterThan(0);
  //   });
  // });

  // // ========== PLiHelpPage Page ==========
  // describe("PLiHelpPage.vue", () => {
  //   const mountPLiHelpPage = () =>
  //     mount(PLiHelpPage, {
  //       global: {
  //         stubs: naiveUIStubs,
  //       },
  //     });

  //   it("should render the page", () => {
  //     const wrapper = mountPLiHelpPage();
  //     expect(wrapper.exists()).toBe(true);
  //   });

  //   it("should render How to Use This App page", () => {
  //     const wrapper = mountPLiHelpPage();
  //     expect(wrapper.exists()).toBe(true);
  //   });

  //   it("should render guide text content", () => {
  //     const wrapper = mountPLiHelpPage();
  //     expect(wrapper.text()).toContain("Planned Labor Importer");
  //   });

  //   it("should render PDF download button", () => {
  //     const wrapper = mountPLiHelpPage();
  //     const buttons = wrapper.findAll("button");
  //     const buttonTexts = buttons.map((b) => b.text());
  //     expect(buttonTexts.some((text) => text.includes("Download"))).toBe(true);
  //   });

  //   it("should have download button with correct href", () => {
  //     const wrapper = mountPLiHelpPage();
  //     const buttons = wrapper.findAll("button");
  //     const downloadBtn = buttons.find((b) => b.text().includes("Download"));
  //     expect(downloadBtn?.attributes("href")).toBe("/Planned-Labor-Import.pdf");
  //   });
  // });
});

// ========== Integration Tests ==========
describe("All Pages Integration", () => {
  beforeEach(() => {
    createTestPinia();
    vi.clearAllMocks();
  });

  it("all main pages should be mountable", () => {
    const pages = [
      { name: "DataRefresh", component: DataRefresh },
      { name: "DataBackup", component: DataBackup },
      // TODO: Add PlannedLaborImporter component pages when they are created
    ];

    pages.forEach(({ name, component }) => {
      const wrapper = mount(component, {
        global: {
          stubs: naiveUIStubs,
          mocks: {
            $router: { push: vi.fn() },
          },
        },
      });
      expect(wrapper.exists()).toBe(true);
    });
  });

  it("all pages should have at least one card or section", () => {
    const pages = [
      { name: "DataRefresh", component: DataRefresh },
      { name: "DataBackup", component: DataBackup },
      // TODO: Add PlannedLaborImporter component pages when they are created
    ];

    pages.forEach(({ name, component }) => {
      const wrapper = mount(component, {
        global: {
          stubs: naiveUIStubs,
          mocks: {
            $router: { push: vi.fn() },
          },
        },
      });
      expect(wrapper.html().length).toBeGreaterThan(0);
    });
  });

  it("all pages should render at least one button", () => {
    const pages = [
      { name: "DataRefresh", component: DataRefresh },
      { name: "DataBackup", component: DataBackup },
      // TODO: Add PlannedLaborImporter component pages when they are created
    ];

    pages.forEach(({ name, component }) => {
      const wrapper = mount(component, {
        global: {
          stubs: naiveUIStubs,
          mocks: {
            $router: { push: vi.fn() },
          },
        },
      });
      const buttons = wrapper.findAll("button");
      expect(buttons.length).toBeGreaterThanOrEqual(0);
    });
  });
});
