Reimplements (possibly a subset of) dijkstra viz functionality with a better model that emphasizes separation of concerns.

todo: change files to singleton classes?

currently GraphUI <-> ExternalState

todo: arrow labels
todo: add internal model and redo pipeline to GraphUI -> ExternalModel -> InternalModel -> ExternalModel -> GraphUI.
  - InternalModel is the only layer that can add/remove nodes/edges
  - InternalModel should use an adjacency list. This will require nontrivial representation conversion between Internal and External Models. This nontrivial conversion highlights gulf btw models.
todo: add Dijkstra to InternalModel