from abc import ABC, abstractmethod
from typing import List, Optional
from domain.models.project_group import ProjectGroup, ProjectStatus

class IProjectGroupRepository(ABC):
    @abstractmethod
    def create(self, project_group: ProjectGroup) -> ProjectGroup:
        pass
    
    @abstractmethod
    def get_by_id(self, group_id: int) -> Optional[ProjectGroup]:
        pass
    
    @abstractmethod
    def get_by_leader_id(self, leader_id: int) -> List[ProjectGroup]:
        pass
    
    @abstractmethod
    def get_by_member_id(self, member_id: int) -> List[ProjectGroup]:
        pass
    
    @abstractmethod
    def get_all(self) -> List[ProjectGroup]:
        pass
    
    @abstractmethod
    def update(self, project_group: ProjectGroup) -> ProjectGroup:
        pass
    
    @abstractmethod
    def delete(self, group_id: int) -> bool:
        pass
    
    @abstractmethod
    def add_member(self, group_id: int, member_id: int) -> bool:
        pass
    
    @abstractmethod
    def remove_member(self, group_id: int, member_id: int) -> bool:
        pass
    
    @abstractmethod
    def update_status(self, group_id: int, status: ProjectStatus) -> bool:
        pass
