import traverse, { NodePath } from "@babel/traverse";
import t, { type CallExpression, type Node } from "@babel/types";
import generate from "@babel/generator";

/**
 * remove getFieldDecorator()
 * Form.getFieldDecorator('name', { valuePropName: 'checked' })(<Checkbox />)
 * @param path
 */
export function removeGetFieldDecorators(path: NodePath<CallExpression>) {
  // 查找 getFieldDecorator调用
  if (
    t.isIdentifier(path.node.callee) &&
    path.node.callee.name === "getFieldDecorator"
  ) {
    // const parent = path.parentPath;
    // console.log(parent.node.type);
    // Bun.write(
    //   `console/parent${parent.node.start}.js`,
    //   generate(parent.node).code,
    // );
    // return false;
    // 查找父级JSXElement
    const parentJSXElement = path.findParent((parent) => {
      return t.isJSXElement(parent.node);
    });
    if (parentJSXElement === null) return false;
    // 获取getFieldDecorator的参数
    const getFieldDecoratorArgs = path.node.arguments;
    const attributes: t.JSXAttribute[] = [];
    // 收集getFieldDecorator的参数,准备添加到JSXElement
    getFieldDecoratorArgs.forEach((item, index) => {
      if (index === 0 && t.isStringLiteral(item)) {
        const name = item.value;
        attributes.push(
          t.jSXAttribute(t.jSXIdentifier("name"), t.stringLiteral(name)),
        );
        return;
      }
      if (index === 0 && t.isIdentifier(item)) {
        attributes.push(
          t.jSXAttribute(
            t.jSXIdentifier("name"),
            t.jSXExpressionContainer(item),
          ),
        );
        return;
      }
      if (index === 1) {
        if (t.isObjectExpression(item)) {
          const properties = item.properties;
          properties.forEach((prop) => {
            if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
              if (!t.isRestElement(prop.value) && !t.isPattern(prop.value)) {
                attributes.push(
                  t.jSXAttribute(
                    t.jSXIdentifier(prop.key.name),
                    t.jSXExpressionContainer(prop.value),
                  ),
                );
              }
            }
          });
        }
      }
    });
    if (attributes.length > 0) {
      if ("openingElement" in parentJSXElement.node) {
        // 参数添加到JSXElement
        parentJSXElement.node.openingElement.attributes.push(...attributes);
      }
    }
    /**
     * 查找父级CallExpression,准备拿到JSXElement参数
     * getFieldDecorator("department")(<Input />)
     */
    const callParent = path.parentPath;
    // 过滤条件
    if (!t.isCallExpression(callParent.node)) return;
    // console.log(generate(callParent.node));
    const args = callParent.node.arguments;
    const jSXExpressionContainer = callParent.parentPath;
    if (!t.isJSXExpressionContainer(jSXExpressionContainer?.node)) return;

    if (args.length > 0) {
      // 父级CallExpression的参数为JSXElement
      const node = args[0];

      if (t.isJSXExpressionContainer(jSXExpressionContainer.node)) {
        if (node && t.isJSXElement(node)) {
          jSXExpressionContainer.replaceWith(node);
        }

        if (node && t.isConditionalExpression(node)) {
          jSXExpressionContainer.replaceWith(t.jSXExpressionContainer(node));
        }
      }
    }

    // Bun.write(
    //   `console/parentJSXElement${parentJSXElement.node.start}.js`,
    //   generate(parentJSXElement.node).code,
    // );
    return true;
  }
  return false;
}
export function removeObjectPropertyGetFieldDecorator(
  path: NodePath<t.Identifier>,
) {
  if (path.node.name === "getFieldDecorator") {
    if (path.parentPath.isObjectProperty()) {
      path.parentPath.remove();
      return true;
    }
  }
}
export function removeEmptyObject(ast: Node) {
  traverse(ast, {
    ObjectPattern: (path) => {
      if (path.node.properties.length === 0) {
        //向上查找,找到VariableDeclarator
        path.findParent((parent) => {
          if (t.isVariableDeclarator(parent.node)) {
            parent.remove();
            return true;
          }
          return false;
        });
      }
    },
  });
}
