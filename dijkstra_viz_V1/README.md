Reimplements (possibly a subset of) dijkstra viz functionality with a better model that emphasizes separation of concerns.

todo: change files to singleton classes?

currently GraphUI <-> ExternalState

done: arrow labels
todo: add internal model and redo pipeline to GraphUI -> ExternalModel -> InternalModel -> ExternalModel -> GraphUI.
  - InternalModel is the only layer that can add/remove nodes/edges
  - InternalModel should use an adjacency list. This will require nontrivial representation conversion between Internal and External Models. This nontrivial conversion highlights gulf btw models.
todo: add Dijkstra to InternalModel
todo: how should ExternalModel and InternalModel store color/node type info? Should external model keep track of semantic information?
todo: clicking on background should do something
todo: remove text highlighting from labels
todo: consider splitting up interfaces into updater and updatee? Does this distinction even make sense?
done: rename esLink and esNode to link and node. remove isLink and isNode
todo: REALLY BAD. clicking on nodes seems to stop arrows from resizing on mouseover. the round trip is desyncing links somehow.