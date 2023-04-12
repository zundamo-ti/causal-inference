# Causal Analysis & Optimization for Everyone

## What's this

The goal is to provide a service that allows anyone to do the followings

- Causal Discovery
- Causal Inference
- Optimization of Intervention

The present version implement only causal inference part.

## Prerequisites

- python 3.10
- pipenv 2022.12.19
- node 18.13.0
- npm 9.5.0

## Launch Application

1. Installing Dependencies `pipenv install`
2. Start running api server by `pipenv run poe serve`
3. Start web server by `npm run dev`
4. Access `http://localhost:5173`

## Quick Start

1. Follow the instructions above to launch the application.
2. Select a csv file with its cell values are continuous real numbers and push the upload button. Then you can see nodes such that the names are the column names of the csv you selected.
3. Select intervention nodes and the outcom node.
   1. Right-click a node. Then you can see a prompt with the message "介入変数に設定しますか？".
   2. Confirm it to add the node to intervention nodes.
   3. If you deny it, you can see a prompt with the message "アウトカム変数に設定しますか？".
   4. Confirm it to set the node to the outcome node.
   5. Deny it to finish with no changes.
4. Create directed edges to define causal relationships between the nodes.
   1. Double-click a node. Then you can see an arrow from the node. Its arrowhead follows your cursor.
   2. Click an node to create edge from the node you double-clicked above to the node you clicked here.
   3. Click outside the nodes to discard the arrow you created.
5. Push the inference button to estimate the causal effect of intervention nodes to the outcome node.

## Remarks

- The causal effects are calculated as simulteneous causal effects. The theory and logic is founded in the book of Miyagawa.

## Reference

- [J.Pearl, M.Glymour, N.P.Jewell(著)/落海 浩(訳)入門 統計的因果推論](https://www.asakura.co.jp/detail.php?book_code=12241)
- [宮川雅巳. (2004). 統計的因果推論ー回帰分析の新しい枠組みー. 朝倉書店.](https://www.asakura.co.jp/detail.php?book_code=12781)
- [Tian, J., & Paz, A., & Pearl, J. (1998). Finding Minimal D-separators. Tech. Rep. R-254, Univ. of California, Los Angeles.](https://ftp.cs.ucla.edu/pub/stat_ser/r254.pdf)
- [Acid, S., & De Campos, L. M. (2013). An algorithm for finding minimum d-separating sets in belief networks. arXiv preprint arXiv:1302.3549.](https://arxiv.org/abs/1302.3549)
