<template>
  <div>
    <!-- <h1>HTML Attributes & DOM Properties</h1> -->
    <h2>HTML Attributes的概念</h2>
    <p><pre>
    HTML Attributes是由HTML语言规范定义的, 在书写HTML文档时, 写在HTML起始标签中的名值对;
    例如:
    <code>&lt;div
        id="xxx"
        class="box box_big"
        style="display: block; padding: 0, 10px"
        aria-disabled
        aria-owns="">
    &lt;/div></code>
    名值对中的名称是kebab-case风格的, 值包裹在双引号中.
    不同的attr, 其值的书写规则是不同的.
    <mark>注意: 并不是所有的attr都必须是名值对, 还可以只有名称,
        例如上例的aria-disabled, 这类attr表示开启或关闭标签的某种特性(或某种行为).</mark>
    HTML attributes are not defined by JavaScript.
    They are static. They are not changeable by JavaScript.
    </pre></p>

    <h2>DOM Properties的概念</h2>
    <p><pre>
    DOM Properties是由DOM规范定义的, 是DOM节点对象的属性;
    DOM节点是由浏览器解析HTML文档后, 生成的一个树形结构的对象;
    </pre></p>
  </div>
</template>
