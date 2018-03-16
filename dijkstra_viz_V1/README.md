Reimplements (possibly a subset of) dijkstra viz functionality with a better model that emphasizes separation of concerns.

todo: change files to singleton classes?

becoming GraphUI -> ExternalModel -> InternalModel -> ExternalModel -> GraphUI.
Some things short circuit and are just GraphUI <-> ExternalModel.
To bubble up from InternalModel, call update__. To push down, call a specific method.

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
todo: REALLY BAD. clicking on nodes seems to stop arrows from resizing on mouseover. the round trip is desyncing links somehow. Appears to be caused by improper mixing of link source and target types. Sometimes a string, sometimes a node. I'm not sure why. CAUSE: simulation should live at the UI level. The simulation mutates its nodes and links as it sees fit and this is the cause of the overwrite of the data. In truth, the External Model should not need to know about the simulation. That's Graph UI's job. If Graph UI handles it then it can mutate its own representation. This may come at a cost since it requires elements that move together to be grouped (probably) and so there is less freedom with overlaying, but this may be a good thing at least in the short term. A longer term solution might be to add _another_ IR just for handling force simulation, but that requires more work and I don't think the payoff will be worth it at the moment. I will revisit this later.
