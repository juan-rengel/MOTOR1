import { createTemplateDemo } from "@/features/templates/create-project";
import { TEMPLATES } from "@/features/templates/registry";
import { projectSchema } from "@/domain/project";
import { createEditorState, editorReducer, setIn, setSectionValue, snapshot, updateBusiness } from "./editor-state";

const base = () => createEditorState(createTemplateDemo(TEMPLATES[0]!));

describe("editorReducer", () => {
  it("edita texto de seção e mantém o projeto válido", () => {
    const state = base();
    const hero = state.project.sections[0]!;
    const next = editorReducer(state, { type: "edit", key: "t", apply: setSectionValue(hero.id, ["title"], "Novo título") });
    expect((next.project.sections[0]!.props as { title: string }).title).toBe("Novo título");
    expect(projectSchema.safeParse(next.project).success).toBe(true);
    expect(next.past).toHaveLength(1);
  });

  it("agrupa digitação contínua no mesmo campo em um único passo de desfazer", () => {
    let state = base();
    state = editorReducer(state, { type: "edit", key: "name", apply: updateBusiness({ name: "A" }), now: 1000 });
    state = editorReducer(state, { type: "edit", key: "name", apply: updateBusiness({ name: "AB" }), now: 1200 });
    state = editorReducer(state, { type: "edit", key: "name", apply: updateBusiness({ name: "ABC" }), now: 1400 });
    expect(state.past).toHaveLength(1);
    state = editorReducer(state, { type: "undo" });
    expect(state.project.business.name).toBe("Torque Garage");
    state = editorReducer(state, { type: "redo" });
    expect(state.project.business.name).toBe("ABC");
  });

  it("reordena, adiciona, duplica e remove seções", () => {
    let state = base();
    const [first, second] = state.project.sections;
    state = editorReducer(state, { type: "moveSection", sectionId: first!.id, delta: 1 });
    expect(state.project.sections[0]!.id).toBe(second!.id);
    expect(state.project.sections[1]!.id).toBe(first!.id);

    const count = state.project.sections.length;
    state = editorReducer(state, { type: "addSection", sectionType: "faq", afterId: first!.id });
    expect(state.project.sections).toHaveLength(count + 1);
    const added = state.project.sections[2]!;
    expect(added.type).toBe("faq");
    expect(added.anchor).not.toBe("perguntas"); // já existia no modelo → âncora única
    expect(state.selectedSectionId).toBe(added.id);

    state = editorReducer(state, { type: "duplicateSection", sectionId: added.id });
    const copy = state.project.sections[3]!;
    expect(copy.type).toBe("faq");
    expect(copy.id).not.toBe(added.id);
    expect(projectSchema.safeParse(state.project).success).toBe(true);

    state = editorReducer(state, { type: "removeSection", sectionId: copy.id });
    expect(state.project.sections.find((s) => s.id === copy.id)).toBeUndefined();
  });

  it("não move além dos limites", () => {
    const state = base();
    const first = state.project.sections[0]!;
    expect(editorReducer(state, { type: "moveSection", sectionId: first.id, delta: -1 })).toBe(state);
  });

  it("detecta alterações não salvas pelo instantâneo", () => {
    let state = base();
    expect(snapshot(state.project)).toBe(state.savedSnapshot);
    state = editorReducer(state, { type: "edit", key: "n", apply: updateBusiness({ name: "Outro" }) });
    expect(snapshot(state.project)).not.toBe(state.savedSnapshot);
    state = editorReducer(state, { type: "saved", project: { ...state.project, revision: 1 } });
    expect(snapshot(state.project)).toBe(state.savedSnapshot);
    expect(state.project.revision).toBe(1);
  });
});

describe("setIn", () => {
  it("atualiza caminhos aninhados sem mutar o original", () => {
    const original = { a: [{ b: 1 }, { b: 2 }] };
    const next = setIn(original, ["a", 1, "b"], 9);
    expect(next.a[1]!.b).toBe(9);
    expect(original.a[1]!.b).toBe(2);
    expect(next.a[0]).toBe(original.a[0]);
  });
});
