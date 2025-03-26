// 这个插件会显示选中元素的色值信息

// 显示 UI 界面
figma.showUI(__html__, { width: 320, height: 220 });

// 监听来自 UI 的消息
figma.ui.onmessage = (msg) => {
  console.log("插件收到 UI 消息:", msg);

  if (msg.type === "ui-loaded") {
    console.log("UI 已加载，发送初始数据");
    // UI 已加载，立即发送当前选择的数据
    handleSelectionChange();
  } else if (msg.type === "create-shapes") {
    const numberOfRectangles = msg.count;

    const nodes: SceneNode[] = [];
    for (let i = 0; i < numberOfRectangles; i++) {
      const rect = figma.createRectangle();
      rect.x = i * 150;
      rect.fills = [{ type: "SOLID", color: { r: 1, g: 0.5, b: 0 } }];
      figma.currentPage.appendChild(rect);
      nodes.push(rect);
    }
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);

    // 创建形状后更新色值显示
    handleSelectionChange();
  } else if (msg.type === "cancel") {
    figma.closePlugin();
  }
};

// 将 RGB 值转换为 HEX 格式
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// 获取节点的色值信息
function getNodeColors(
  node: SceneNode
): { hex: string; rgb: string; alpha: number; rgba: string }[] {
  const colors: { hex: string; rgb: string; alpha: number; rgba: string }[] =
    [];

  // 检查节点是否有填充
  if ("fills" in node && node.fills) {
    const fills = node.fills as Paint[];

    // 确保fills是数组并且可以迭代
    if (Array.isArray(fills)) {
      fills.forEach((fill) => {
        if (fill.type === "SOLID" && fill.visible !== false) {
          const { r, g, b } = fill.color;
          const alpha = fill.opacity !== undefined ? fill.opacity : 1;
          const formattedAlpha = Number.isInteger(alpha)
            ? alpha.toString()
            : alpha.toFixed(2);
          const hex = rgbToHex(r, g, b);
          const rgb = `rgb(${Math.round(r * 255)}, ${Math.round(
            g * 255
          )}, ${Math.round(b * 255)})`;
          const rgba = `rgba(${Math.round(r * 255)}, ${Math.round(
            g * 255
          )}, ${Math.round(b * 255)}, ${formattedAlpha})`;

          colors.push({ hex, rgb, alpha, rgba });
        }
      });
    }
  }

  // 检查节点是否有描边
  if ("strokes" in node && node.strokes) {
    const strokes = node.strokes as Paint[];

    // 确保strokes是数组并且可以迭代
    if (Array.isArray(strokes)) {
      strokes.forEach((stroke) => {
        if (stroke.type === "SOLID" && stroke.visible !== false) {
          const { r, g, b } = stroke.color;
          const alpha = stroke.opacity !== undefined ? stroke.opacity : 1;
          const formattedAlpha = Number.isInteger(alpha)
            ? alpha.toString()
            : alpha.toFixed(2);
          const hex = rgbToHex(r, g, b);
          const rgb = `rgb(${Math.round(r * 255)}, ${Math.round(
            g * 255
          )}, ${Math.round(b * 255)})`;
          const rgba = `rgba(${Math.round(r * 255)}, ${Math.round(
            g * 255
          )}, ${Math.round(b * 255)}, ${formattedAlpha})`;

          colors.push({ hex, rgb, alpha, rgba });
        }
      });
    }
  }

  return colors;
}

// 处理选择变化
function handleSelectionChange() {
  console.log("Selection changed");
  const selection = figma.currentPage.selection;
  console.log("Selection length:", selection.length);

  if (selection.length > 0) {
    // 获取所有选中节点的色值
    let allColors: { hex: string; rgb: string; alpha: number }[] = [];

    selection.forEach((node) => {
      console.log("Processing node:", node.type);
      const nodeColors = getNodeColors(node);
      console.log("Node colors:", nodeColors);
      allColors = [...allColors, ...nodeColors];
    });

    console.log("Sending colors to UI:", allColors);
    // 发送色值信息到 UI
    figma.ui.postMessage({
      type: "selection-colors",
      colors: allColors,
    });
  } else {
    console.log("No selection");
    // 没有选中任何节点
    figma.ui.postMessage({
      type: "selection-colors",
      colors: [],
    });
  }
}

// 初始化时处理当前选择
// 注释掉这行，改为在 UI 加载完成后触发
// handleSelectionChange();

// 监听选择变化事件
figma.on("selectionchange", () => {
  console.log("选择已变化，发送新数据");
  handleSelectionChange();
});

// 发送测试消息到 UI
setTimeout(() => {
  console.log("发送测试消息到 UI");
  figma.ui.postMessage({
    type: "selection-colors",
    colors: [{ hex: "#FF0000", rgb: "R: 255, G: 0, B: 0", alpha: 1 }],
  });
}, 1000);
